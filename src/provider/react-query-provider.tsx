"use client"

import {ApiRequestError} from "@/interface/axios-interface";
import errorLogger from "@/lib/error-logger";
import {toast, Toaster} from "sonner";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {PropsWithChildren} from "react";

const handleQueryError = (error: unknown) => {
    console.error("Query error", error)

    if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
        const apiError = error as ApiRequestError;

        if (apiError.status === 401 || apiError.status === 403) {
            return;
        }

        // Create API error object for logging
        const errorObj = error as unknown as {
            message: string;
            status?: number;
            config?: { url?: string };
            response?: {
                status: number;
                statusText: string;
                data?: { statusCode: number; message: string };
            };
        };

        const logApiError: ApiRequestError = {
            url: errorObj.config?.url || undefined,
            message: errorObj.message,
            status: typeof errorObj.status === "number" ? errorObj.status : null,
            response: {
                data: {
                    statusCode: errorObj.response?.status || 0,
                    message: errorObj.message
                },
                status: errorObj.response?.status || 0,
                statusText: errorObj.response?.statusText || "Unknown Error"
            }
        };

        // Log API errors (excluding auth errors for queries)
        if (apiError.status !== 401 && apiError.status !== 403) {
            errorLogger.logApiError(logApiError, {
                component: "ReactQuery",
                action: "query_error"
            });
        }

        // Show user-friendly error message
        const errorMessage =
            apiError.message || "An error occurred on load data";
        toast.error(errorMessage, {
            description:
                "Please try again, or contact system administrator if errors occured.",
            action: {
                label: "Try again",
                onClick: () => window.location.reload()
            }
        });
    }else{
        toast.error("Error", {
            description: "Unknown error occurred on load data",
            duration: 5000
        });
    }
}

const handleMutationError = (error: unknown) => {
    console.error("Mutation Error:", error);

    if (error && typeof error === "object" && "message" in error) {
        const errorObj = error as unknown as {
            message: string;
            status?: number;
            config?: { url?: string };
            response?: {
                status: number;
                statusText: string;
                data?: { statusCode: number; message: string };
            };
        };

        const apiError: ApiRequestError = {
            url: errorObj.config?.url || undefined,
            message: errorObj.message,
            status: typeof errorObj.status === "number" ? errorObj.status : null,
            response: {
                data: {
                    statusCode: errorObj.response?.status || 0,
                    message: errorObj.message
                },
                status: errorObj.response?.status || 0,
                statusText: errorObj.response?.statusText || "Unknown Error"
            }
        };

        // Log mutation errors
        errorLogger.logApiError(apiError, {
            component: "ReactQuery",
            action: "mutation_error"
        });

        // Show user-friendly error message
        const errorMessage =
            apiError.message || "Terjadi kesalahan saat menyimpan data";
        toast.error(errorMessage, {
            description:
                "Silakan coba lagi atau hubungi administrator jika masalah berlanjut.",
            action: {
                label: "Coba Lagi",
                onClick: () => {
                    // This would typically retry the mutation
                    // Implementation depends on the specific mutation
                }
            }
        });

    }else{
        toast.error("Error", {
            description: "Terjadi kesalahan yang tidak terduga",
            duration: 5000
        });
    }
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchInterval: false,
            retry: (failureCount, error) => {
                // Don't retry on 4xx errors (client errors)
                if (error && typeof error === "object" && "status" in error) {
                    const status = (error as unknown as { status?: number }).status;
                    if (status && status >= 400 && status < 500) {
                        return false;
                    }
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchIntervalInBackground: false,
            gcTime: 1000 * 60 * 15,
            refetchOnMount: false,
            refetchOnReconnect: false
        },
        mutations: {
            retry: (failureCount, error) => {
                // Don't retry mutations on client errors
                if (error && typeof error === "object" && "status" in error) {
                    const status = (error as unknown as { status?: number }).status;
                    if (status && status >= 400 && status < 500) {
                        return false;
                    }
                }
                // Retry once for server errors
                return failureCount < 1;
            },
            retryDelay: 1000
        }
    },
    queryCache: new QueryCache({
        onError: handleQueryError
    }),
    mutationCache: new MutationCache({
        onError: handleMutationError
    })
});

function ReactQueryDevtools(props: { initialIsOpen: boolean, buttonPosition: string, position: string }) {
    return null;
}


export function ReactQueryProvider({ children }: PropsWithChildren) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools
                initialIsOpen={false}
                buttonPosition="bottom-right"
                position="bottom"
            />
            <Toaster />
        </QueryClientProvider>
    );
}

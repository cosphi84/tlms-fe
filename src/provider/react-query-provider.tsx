"use client";
import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
    MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {type PropsWithChildren, useState} from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/atoms/sonner";
import { type ApiRequestError } from "@/lib/axios";
import { errorLogger } from "@/lib/error-logger";

// ─── Helpers ────────────────────────────────────────────────────────────────

function isApiRequestError(error: unknown): error is ApiRequestError {
    return (
        error !== null &&
        typeof error === "object" &&
        "message" in error &&
        "isNetworkError" in error &&
        "isServerError" in error &&
        "timestamp" in error
    );
}

function toApiRequestError(error: unknown): ApiRequestError | null {
    return isApiRequestError(error) ? error : null;
}

function showErrorToast(message: string, onRetry?: () => void) {
    toast.error(message, {
        description: "Silakan coba lagi atau hubungi administrator jika masalah berlanjut.",
        ...(onRetry && {
            action: { label: "Coba Lagi", onClick: onRetry },
        }),
    });
}

// ─── Error Handlers ─────────────────────────────────────────────────────────

function handleQueryError(error: unknown) {
    const apiError = toApiRequestError(error);
    if (!apiError) {
        toast.error("Error", { description: "Terjadi kesalahan yang tidak terduga", duration: 5000 });
        return;
    }

    // Auth errors are handled by the auth layer — skip toast
    if (apiError.status === 401 || apiError.status === 403) return;

    errorLogger.logApiError(apiError, { component: "ReactQuery", action: "query_error" });

    showErrorToast(
        apiError.message ?? "Terjadi kesalahan saat memuat data",
        () => window.location.reload()
    );
}

function handleMutationError(error: unknown) {
    const apiError = toApiRequestError(error);
    if (!apiError) {
        toast.error("Error", { description: "Terjadi kesalahan yang tidak terduga", duration: 5000 });
        return;
    }

    errorLogger.logApiError(apiError, { component: "ReactQuery", action: "mutation_error" });

    // Note: mutation retry is context-dependent; caller should handle it
    showErrorToast(apiError.message ?? "Terjadi kesalahan saat menyimpan data");
}

// ─── Retry Policy ────────────────────────────────────────────────────────────

function isClientError(error: unknown): boolean {
    if (error && typeof error === "object" && "status" in error) {
        const status = (error as { status?: number }).status;
        return typeof status === "number" && status >= 400 && status < 500;
    }
    return false;
}

// ─── Factory (avoids SSR singleton leak) ────────────────────────────────────

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchInterval: false,
                refetchIntervalInBackground: false,
                gcTime: 1000 * 60 * 15,
                retry: (failureCount, error) => !isClientError(error) && failureCount < 3,
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
            },
            mutations: {
                retry: (failureCount, error) => !isClientError(error) && failureCount < 1,
                retryDelay: 1_000,
            },
        },
        queryCache: new QueryCache({ onError: handleQueryError }),
        mutationCache: new MutationCache({ onError: handleMutationError }),
    });
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ReactQueryProvider({ children }: PropsWithChildren) {
    // Lazy initializer — runs once on mount, never re-runs
    // State value (not .current) is safe to read during render
    const [client] = useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={client}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" position="bottom" />
            <Toaster />
        </QueryClientProvider>
    );
}
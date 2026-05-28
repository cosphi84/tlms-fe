"use client"

import React, {Component, ErrorInfo, ReactNode} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) : State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console for development
        console.error("ErrorBoundary caught an error:", error, errorInfo);

        // Update state with error info
        this.setState({
            error,
            errorInfo
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        // In production, you might want to log this to an error reporting service
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Oops! Error has occurred!
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                This App went un-predicted error. Call the administrator system please.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                                        Error Details (Development Only):
                                    </h4>
                                    <pre className="text-xs text-red-700 dark:text-red-300 whitespace-pre-wrap wrap-break-word">
                    {this.state.error.message}
                  </pre>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                                                Stack Trace
                                            </summary>
                                            <pre className="text-xs text-red-600 dark:text-red-400 mt-1 whitespace-pre-wrap wrap-break-word">
                        {this.state.errorInfo.componentStack}
                      </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <Button onClick={this.handleReset} className="w-full">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Coba Lagi
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reload Halaman
                                </Button>
                                <Button asChild variant="ghost" className="w-full">
                                    <Link href="/">
                                        <Home className="mr-2 h-4 w-4" />
                                        Kembali ke Beranda
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}


export default ErrorBoundary;

// Hook version for functional components (React 18+)
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null);

    const resetError = React.useCallback(() => {
        setError(null);
    }, []);

    const captureError = React.useCallback((error: Error) => {
        setError(error);
    }, []);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return { captureError, resetError };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, "children">
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
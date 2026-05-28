"use client";

import { useEffect } from "react";
import { Button } from "@/components/atoms/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/atoms/card";
import { AlertTriangle, RefreshCw, Home, Server } from "lucide-react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log the error to console for development
        console.error("Global Application Error:", error);

        // In production, you might want to log this to an error reporting service
        // Example: Sentry.captureException(error, { level: 'fatal' });
    }, [error]);

    const isDevelopment = process.env.NODE_ENV === "development";

    return (
        <html lang="id">
        <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                        <Server className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Critical System Errors
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                        A serious system error has occurred. The application needs to be reloaded to continue.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isDevelopment && (
                        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                                        Global Error Details (Development):
                                    </h4>
                                    <div className="text-sm text-red-700 dark:text-red-300">
                                        <p className="font-medium mb-1">Message:</p>
                                        <pre className="whitespace-pre-wrap wrap-break-word bg-red-100 dark:bg-red-900/40 p-2 rounded text-xs">
                          {error.message}
                        </pre>
                                        {error.digest && (
                                            <>
                                                <p className="font-medium mt-3 mb-1">Error ID:</p>
                                                <code className="bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded text-xs">
                                                    {error.digest}
                                                </code>
                                            </>
                                        )}
                                        {error.stack && (
                                            <details className="mt-3">
                                                <summary className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200">
                                                    Stack Trace
                                                </summary>
                                                <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded whitespace-pre-wrap break-words">
                              {error.stack}
                            </pre>
                                            </details>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isDevelopment && error.digest && (
                        <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3 border">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Error ID:{" "}
                                <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                    {error.digest}
                                </code>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Please provide this ID to the administrator for further investigation.
                            </p>
                        </div>
                    )}

                    <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-3 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start">
                            <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 shrink-0" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                <p className="font-medium mb-1">Catatan Penting:</p>
                                <p>
                                    This is a system-level error that affects the entire application. All unsaved data may be lost.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button onClick={reset} className="w-full">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset Aplication
                        </Button>
                        <Button
                            onClick={() => (window.location.href = "/")}
                            variant="outline"
                            className="w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="ghost"
                            className="w-full"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Full Reload
                        </Button>
                    </div>

                    <div className="text-center pt-4 border-t">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            If this problem persists, please contact{" "}
                            <a
                                href="mailto:mc-pl@seid.sharp-world.com"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                SEID CS Planning Team
                            </a>{" "}
                            by including the Error ID above.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
        </body>
        </html>
    );
}
"use client";

// Error severity levels

import {ApiRequestError} from "@/interface/axios-interface";

export enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}

// Error categories
export enum ErrorCategory {
    API = "api",
    FORM = "form",
    NAVIGATION = "navigation",
    AUTHENTICATION = "authentication",
    VALIDATION = "validation",
    NETWORK = "network",
    RUNTIME = "runtime",
    UNKNOWN = "unknown"
}

// Error log entry interface
export interface ErrorLogEntry {
    id: string;
    timestamp: string;
    message: string;
    stack?: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    url?: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    additionalData?: Record<string, unknown>;
    resolved?: boolean;
}

// Error context for better debugging
export interface ErrorContext {
    component?: string;
    action?: string;
    userId?: string;
    sessionId?: string;
    additionalData?: Record<string, unknown>;
}

class ErrorLogger {
    private logs: ErrorLogEntry[] = [];
    private maxLogs = 100; // Keep last 100 errors in memory
    private sessionId: string;

    constructor() {
        this.sessionId = this.generateSessionId();
        this.setupGlobalErrorHandlers();
    }

    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private setupGlobalErrorHandlers(): void {
        // Handle unhandled promise rejections
        if (typeof window !== "undefined") {
            window.addEventListener("unhandledrejection", (event) => {
                this.logError(
                    new Error(`Unhandled Promise Rejection: ${event.reason}`),
                    {
                        category: ErrorCategory.RUNTIME,
                        severity: ErrorSeverity.HIGH,
                        additionalData: {
                            reason: event.reason,
                            promise: event.promise
                        }
                    }
                );
            });

            // Handle global JavaScript errors
            window.addEventListener("error", (event) => {
                this.logError(new Error(event.message), {
                    category: ErrorCategory.RUNTIME,
                    severity: ErrorSeverity.HIGH,
                    additionalData: {
                        filename: event.filename,
                        lineno: event.lineno,
                        colno: event.colno,
                        error: event.error
                    }
                });
            });
        }
    }

    // Main error logging method
    logError(
        error: Error | ApiRequestError | string,
        context?: Partial<ErrorContext> & {
            category?: ErrorCategory;
            severity?: ErrorSeverity;
        }
    ): string {
        const errorId = this.generateErrorId();
        const timestamp = new Date().toISOString();

        let message: string;
        let stack: string | undefined;
        let category = context?.category || ErrorCategory.UNKNOWN;
        let severity = context?.severity || ErrorSeverity.MEDIUM;
        let url: string | undefined;

        // Process different error types
        if (typeof error === "string") {
            message = error;
        } else if (this.isApiRequestError(error)) {
            message = error.message;
            url = error.url;
            category = ErrorCategory.API;

            // Determine severity based on status code
            if (error.status !== null && error.status >= 500) {
                severity = ErrorSeverity.HIGH;
            } else if (error.status === 401 || error.status === 403) {
                severity = ErrorSeverity.MEDIUM;
                category = ErrorCategory.AUTHENTICATION;
            } else if (error.status !== null && error.status >= 400) {
                severity = ErrorSeverity.LOW;
            }
        } else if (error instanceof Error) {
            message = error.message;
            stack = error.stack;
        } else {
            message = "Unknown error occurred";
        }

        const logEntry: ErrorLogEntry = {
            id: errorId,
            timestamp,
            message,
            stack,
            category,
            severity,
            url,
            userAgent:
                typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
            userId: context?.userId,
            sessionId: this.sessionId,
            additionalData: context?.additionalData,
            resolved: false
        };

        // Add to logs array
        this.logs.unshift(logEntry);

        // Keep only the last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }

        // Console logging based on severity
        this.consoleLog(logEntry);

        // Send to external logging service in production
        if (process.env.NODE_ENV === "production") {
            this.sendToExternalService(logEntry);
        }

        return errorId;
    }

    // Log API errors specifically
    logApiError(error: ApiRequestError, context?: Partial<ErrorContext>): string {
        return this.logError(error, {
            ...context,
            category: ErrorCategory.API,
            additionalData: {
                ...context?.additionalData,
                isNetworkError: (error as Record<string, unknown>)
                    .isNetworkError as boolean,
                isServerError: (error as Record<string, unknown>)
                    .isServerError as boolean,
                isClientError: (error as Record<string, unknown>)
                    .isClientError as boolean,
                isAuthError: (error as Record<string, unknown>).isAuthError as boolean,
                status: error.status
            }
        });
    }

    // Log form errors
    logFormError(
        error: Error | string,
        formName: string,
        fieldName?: string,
        context?: Partial<ErrorContext>
    ): string {
        return this.logError(error, {
            ...context,
            category: ErrorCategory.FORM,
            severity: ErrorSeverity.LOW,
            additionalData: {
                ...context?.additionalData,
                formName,
                fieldName
            }
        });
    }

    // Log validation errors
    logValidationError(
        error: Error | string,
        context?: Partial<ErrorContext>
    ): string {
        return this.logError(error, {
            ...context,
            category: ErrorCategory.VALIDATION,
            severity: ErrorSeverity.LOW
        });
    }

    // Get all logs
    getLogs(): ErrorLogEntry[] {
        return [...this.logs];
    }

    // Get logs by category
    getLogsByCategory(category: ErrorCategory): ErrorLogEntry[] {
        return this.logs.filter((log) => log.category === category);
    }

    // Get logs by severity
    getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
        return this.logs.filter((log) => log.severity === severity);
    }

    // Mark error as resolved
    markAsResolved(errorId: string): boolean {
        const log = this.logs.find((log) => log.id === errorId);
        if (log) {
            log.resolved = true;
            return true;
        }
        return false;
    }

    // Clear all logs
    clearLogs(): void {
        this.logs = [];
    }

    // Get error statistics
    getErrorStats(): {
        total: number;
        byCategory: Record<ErrorCategory, number>;
        bySeverity: Record<ErrorSeverity, number>;
        resolved: number;
        unresolved: number;
    } {
        const stats = {
            total: this.logs.length,
            byCategory: {} as Record<ErrorCategory, number>,
            bySeverity: {} as Record<ErrorSeverity, number>,
            resolved: 0,
            unresolved: 0
        };

        // Initialize counters
        Object.values(ErrorCategory).forEach((category) => {
            stats.byCategory[category] = 0;
        });
        Object.values(ErrorSeverity).forEach((severity) => {
            stats.bySeverity[severity] = 0;
        });

        // Count logs
        this.logs.forEach((log) => {
            stats.byCategory[log.category]++;
            stats.bySeverity[log.severity]++;
            if (log.resolved) {
                stats.resolved++;
            } else {
                stats.unresolved++;
            }
        });

        return stats;
    }

    private generateErrorId(): string {
        return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isApiRequestError(error: any): error is ApiRequestError {
        return (
            error &&
            typeof error === "object" &&
            "status" in error &&
            "message" in error
        );
    }

    private consoleLog(logEntry: ErrorLogEntry): void {
        const logMethod = this.getConsoleMethod(logEntry.severity);
        const prefix = `[${logEntry.category.toUpperCase()}] [${logEntry.severity.toUpperCase()}]`;

        logMethod(`${prefix} ${logEntry.message}`, {
            id: logEntry.id,
            timestamp: logEntry.timestamp,
            stack: logEntry.stack,
            additionalData: logEntry.additionalData
        });
    }

    private getConsoleMethod(severity: ErrorSeverity): typeof console.log {
        switch (severity) {
            case ErrorSeverity.CRITICAL:
            case ErrorSeverity.HIGH:
                return console.error;
            case ErrorSeverity.MEDIUM:
                return console.warn;
            case ErrorSeverity.LOW:
            default:
                return console.log;
        }
    }

    private async sendToExternalService(logEntry: ErrorLogEntry): Promise<void> {
        try {
            // Here you would send to your external logging service
            // Examples: Sentry, LogRocket, DataDog, etc.

            // For now, we'll just store in localStorage as a fallback
            if (typeof window !== "undefined" && window.localStorage) {
                const existingLogs = localStorage.getItem("error_logs");
                const logs = existingLogs ? JSON.parse(existingLogs) : [];
                logs.unshift(logEntry);

                // Keep only last 50 logs in localStorage
                const trimmedLogs = logs.slice(0, 50);
                localStorage.setItem("error_logs", JSON.stringify(trimmedLogs));
            }
        } catch (error) {
            console.error("Failed to send error to external service:", error);
        }
    }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

export default errorLogger;

// Convenience functions
export const logError = (
    error: Error | ApiRequestError | string,
    context?: Partial<ErrorContext>
) => errorLogger.logError(error, context);

export const logApiError = (
    error: ApiRequestError,
    context?: Partial<ErrorContext>
) => errorLogger.logApiError(error, context);

export const logFormError = (
    error: Error | string,
    formName: string,
    fieldName?: string,
    context?: Partial<ErrorContext>
) => errorLogger.logFormError(error, formName, fieldName, context);

export const logValidationError = (
    error: Error | string,
    context?: Partial<ErrorContext>
) => errorLogger.logValidationError(error, context);

export const getErrorLogs = () => errorLogger.getLogs();
export const getErrorStats = () => errorLogger.getErrorStats();
export const clearErrorLogs = () => errorLogger.clearLogs();
export const markErrorAsResolved = (errorId: string) =>
    errorLogger.markAsResolved(errorId);
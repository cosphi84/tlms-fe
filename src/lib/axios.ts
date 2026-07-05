import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuid4 } from "uuid";
import CookieBrowser from "js-cookie";
import {
    COOKIE_NAMES,
    clearAuthCookies,
    rotateAccessToken,
} from "@/helpers/auth-helper";
import type { RefreshResponse } from "@/types/user-interface";

// ─── Config ──────────────────────────────────────────────────────────────────

const apiHost = process.env["NEXT_PUBLIC_TLMS_BACKEND_API"];

export const axiosMultiPartConfig: AxiosRequestConfig = {
    headers: { "Content-Type": "multipart/form-data" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

// Extend Axios config to support request metadata and retry flag
declare module "axios" {
    interface InternalAxiosRequestConfig {
        metadata?: { startTime: number };
        _retry?: boolean;
    }
}

export interface ApiRequestError {
    url: string | undefined;
    message: string;
    status: number | string | null;
    response: {
        data: { statusCode: number; message: string };
        status: number;
        statusText: string;
    };
    isNetworkError: boolean;
    isServerError: boolean;
    isClientError: boolean;
    isAuthError: boolean;
    timestamp: string;
}

export type Instance = ReturnType<typeof createInstance>;

// ─── Error Helpers ───────────────────────────────────────────────────────────

export function getErrorMessage(
    error: AxiosError<{ message: string; statusCode: number; fields?: string[] }>
): Pick<ApiRequestError, "url" | "message" | "status"> {
    if (error.response) {
        const { status, statusText, data } = error.response;
        return {
            url: error.config?.url,
            message: data?.message || statusText || "Error",
            status: status ?? statusText ?? null,
        };
    }
    if (error.request) {
        return {
            url: error.config?.url,
            message: "Network error — no response received",
            status: null,
        };
    }
    return {
        url: error.config?.url,
        message: error.message || "Error",
        status: null,
    };
}

function buildApiRequestError(
    error: AxiosError<{ message: string; statusCode: number }>
): ApiRequestError {
    const base = getErrorMessage(error);
    const httpStatus = error.response?.status ?? 0;

    return {
        ...base,
        response: {
            data: { statusCode: httpStatus, message: base.message },
            status: httpStatus,
            statusText: error.response?.statusText ?? "Unknown Error",
        },
        isNetworkError: !error.response,
        isServerError: httpStatus >= 500,
        isClientError: httpStatus >= 400 && httpStatus < 500,
        isAuthError: httpStatus === 401 || httpStatus === 403,
        timestamp: new Date().toISOString(),
    };
}

// ─── Silent Refresh (token rotation) ─────────────────────────────────────────
//
// Pattern: mutex + queue.
// Only ONE refresh call is in-flight at a time. Subsequent 401s are queued and
// resolved/rejected after the single refresh resolves.
//

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (token) resolve(token);
        else reject(error);
    });
    failedQueue = [];
}

/** Call BE refresh endpoint directly (no interceptor loop). */
async function doRefresh(): Promise<string> {
    const refreshToken = CookieBrowser.get(COOKIE_NAMES.refreshToken);
    if (!refreshToken) throw new Error("No refresh token");

    const res = await axios.post<RefreshResponse>(
        `${apiHost}auth/refresh`,
        {},
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshToken}`,
            },
        }
    );

    const { access_token, refresh_token } = res.data;
    rotateAccessToken(access_token, refresh_token);
    return access_token;
}

// ─── Instance Factory ────────────────────────────────────────────────────────

function createInstance(token?: string) {
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const instance = axios.create({
        baseURL: apiHost,
        headers: {
            "Content-Type": "application/json",
            "X-Request-ID": uuid4(),
            ...authHeader,
        },
    });

    // ── Request interceptor ──────────────────────────────────────────────────

    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            config.metadata = { startTime: Date.now() };

            // Always attach latest access token from cookie (handles rotated tokens)
            const latestToken = CookieBrowser.get(COOKIE_NAMES.accessToken) ?? token;
            if (latestToken) {
                config.headers["Authorization"] = `Bearer ${latestToken}`;
            }

            if (process.env.NODE_ENV === "development") {
                console.log("→ API Request:", {
                    method: config.method?.toUpperCase(),
                    url: `${config.baseURL}${config.url}`,
                });
            }

            return config;
        },
        (error) => {
            console.error("Request setup error:", error);
            return Promise.reject(error);
        }
    );

    // ── Response interceptor ─────────────────────────────────────────────────

    instance.interceptors.response.use(
        (response) => {
            if (process.env.NODE_ENV === "development") {
                const duration = response.config.metadata
                    ? Date.now() - response.config.metadata.startTime
                    : -1;
                console.log(`← ${response.status} ${response.config.url} (${duration}ms)`);
            }
            return response.data;
        },
        async (error: AxiosError<{ message: string; statusCode: number }>) => {
            const originalConfig = error.config;

            // ── Silent token refresh on 401 ──────────────────────────────────
            if (
                error.response?.status === 401 &&
                originalConfig &&
                !originalConfig._retry
            ) {
                if (isRefreshing) {
                    // Queue this request until the in-flight refresh resolves
                    return new Promise<string>((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((newToken) => {
                            originalConfig.headers["Authorization"] = `Bearer ${newToken}`;
                            return instance(originalConfig);
                        })
                        .catch((err) => Promise.reject(buildApiRequestError(err)));
                }

                originalConfig._retry = true;
                isRefreshing = true;

                try {
                    const newToken = await doRefresh();
                    processQueue(null, newToken);
                    originalConfig.headers["Authorization"] = `Bearer ${newToken}`;
                    return instance(originalConfig);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    // Refresh failed → clear cookies and redirect to login
                    clearAuthCookies();
                    if (typeof window !== "undefined") {
                        const prev = encodeURIComponent(
                            window.location.pathname + window.location.search
                        );
                        window.location.href = `/login?prev=${prev}`;
                    }
                    return Promise.reject(buildApiRequestError(refreshError as AxiosError<{ message: string; statusCode: number }>));
                } finally {
                    isRefreshing = false;
                }
            }

            // ── All other errors ─────────────────────────────────────────────
            const apiError = buildApiRequestError(error);

            console.error("← API Error:", {
                url: apiError.url,
                status: apiError.status,
                message: apiError.message,
                duration: error.config?.metadata
                    ? Date.now() - error.config.metadata.startTime
                    : -1,
            });

            return Promise.reject(apiError);
        }
    );

    // ── Methods ──────────────────────────────────────────────────────────────

    return {
        get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
            instance.get<T, T>(url, { data: {}, ...config }),

        post: <T = unknown>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> =>
            instance.post<T, T>(url, data, config),

        put: <T = unknown>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> =>
            instance.put<T, T>(url, data, config),

        patch: <T = unknown>(url: string, data: unknown = {}, config?: AxiosRequestConfig): Promise<T> =>
            instance.patch<T, T>(url, data, config),

        delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
            instance.delete<T, T>(url, { data: {}, ...config }),

        download: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
            instance.request<T, T>({
                ...config,
                method: "GET",
                url,
                headers: { "Content-Type": "application/json", ...authHeader },
                responseType: "arraybuffer",
            }),

        request: instance.request.bind(instance),
        apiHost,
    };
}

// ─── Public Factories ────────────────────────────────────────────────────────

/**
 * Browser-side instance.
 * Always reads the latest access token from cookie — handles rotated tokens
 * transparently. Pass withToken=false for unauthenticated requests (e.g. login).
 */
export function createBrowserInstance(withToken = true) {
    const token = withToken
        ? CookieBrowser.get(COOKIE_NAMES.accessToken)
        : undefined;
    return createInstance(token);
}

/**
 * Node/SSR instance. Pass token explicitly from server-side cookie/session.
 */
export function createNodeInstance(token?: string) {
    return createInstance(token);
}
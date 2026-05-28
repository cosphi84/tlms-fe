import axios, {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuid4 } from "uuid";
import CookieBrowser from "js-cookie";

// ─── Config ──────────────────────────────────────────────────────────────────

const apiHost = process.env["NEXT_PUBLIC_TLMS_BACKEND_API"];
const cookieName = { token: "tlms_token", user: "tlms_user" } as const;

export const axiosMultiPartConfig: AxiosRequestConfig = {
    headers: { "Content-Type": "multipart/form-data" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

// Extend Axios config to support request metadata (safe, no cast needed)
declare module "axios" {
    interface InternalAxiosRequestConfig {
        metadata?: { startTime: number };
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
): Pick<ApiRequestError, "url" | "message" | "status"> {  // ← explicit Pick
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
    const base = getErrorMessage(error);   // Pick<ApiRequestError, ...>
    const httpStatus = error.response?.status ?? 0;

    return {
        ...base,                             // url, message, status
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
        (error: AxiosError<{ message: string; statusCode: number }>) => {
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
 * @param withToken - set true to attach the stored JWT (default: true)
 */
export function createBrowserInstance(withToken = true) {
    const token = withToken ? CookieBrowser.get(cookieName.token) : undefined;
    return createInstance(token);
}

/**
 * Node/SSR instance. Pass token explicitly from server-side cookie/session.
 */
export function createNodeInstance(token?: string) {
    return createInstance(token);
}
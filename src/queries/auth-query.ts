"use client"

import { createBrowserInstance, type ApiRequestError } from "@/lib/axios";
import Cookies from "js-cookie";
import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import { type LoginArg, type LoginResponse, type UserProps } from "@/types/user-interface";
import {
    clearAuthCookies,
    setAuthCookies,
    COOKIE_NAMES,
} from "@/helpers/auth-helper";
import { parseCookieUser } from "@/lib/jwt";
import { getQueryString } from "@/queries/url-query";
import { type Query } from "@/types/query-interface";

// ─── Constants ────────────────────────────────────────────────────────────────

const QUERY_KEYS = {
    auth: ["USER", "BY-TOKEN"] as const,
    login: ["LOGIN"] as const,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseGetAuthOptions<TCache, TError, TData>
    extends UseQueryOptions<TCache, TError, TData> {
    redirectToLogin?: boolean;
    query?: Query;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

async function loginRequest(variables: LoginArg): Promise<LoginResponse> {
    const axios = createBrowserInstance(false);
    return axios.post<LoginResponse>("/auth", variables);
}

function handleLoginSuccess(data: LoginResponse, queryClient: QueryClient): void {
    setAuthCookies(data);
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useLogin() {
    const queryClient = useQueryClient();
    return useMutation<LoginResponse, ApiRequestError, LoginArg>({
        mutationKey: QUERY_KEYS.login,
        mutationFn: loginRequest,
        onSuccess: (data) => handleLoginSuccess(data, queryClient),
    });
}

export function useLogout(currentPath?: string) {
    const queryClient = useQueryClient();
    return useCallback(
        (callback?: () => void) => {
            if (!Cookies.get(COOKIE_NAMES.accessToken) && !Cookies.get(COOKIE_NAMES.refreshToken)) return;

            localStorage.clear();
            clearAuthCookies();
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth });
            void queryClient.clear();

            const redirectTarget =
                currentPath ??
                encodeURIComponent(window.location.pathname + window.location.search);

            window.location.href = `/login?prev=${redirectTarget}`;
            callback?.();
        },
        [queryClient, currentPath]
    );
}

/**
 * Returns the currently logged-in user.
 *
 * Strategy:
 *  1. Read the tlms_user cookie (set at login, updated on token rotation).
 *  2. If cookie is missing/corrupt, fall back to GET /user with access token.
 *  3. On any auth error and redirectToLogin=true, call logout().
 */
export function useGetAuth<TData = UserProps>(
    options?: Partial<UseGetAuthOptions<UserProps, ApiRequestError, TData>>
): UseQueryResult<TData, ApiRequestError> {
    const { redirectToLogin = true, query, ...restOptions } = options ?? {};
    const pathname = usePathname();
    const logout = useLogout(pathname);

    const result = useQuery<UserProps, ApiRequestError, TData>({
        queryKey: QUERY_KEYS.auth,
        queryFn: async () => {
            // Fast path: decode from cookie (no network round-trip)
            const cookieUser = parseCookieUser(Cookies.get(COOKIE_NAMES.user));
            if (cookieUser) {
                // Cast CookieUser to UserProps (they share the same shape from BE)
                return cookieUser as unknown as UserProps;
            }

            // Fallback: fetch from BE (e.g., cookie was manually cleared)
            const axios = createBrowserInstance();
            const qs = query ? `?${getQueryString(query)}` : "";
            return axios.get<UserProps>(`/user${qs}`);
        },
        // Don't retry on auth errors — they go straight to logout
        retry: (failureCount, error) => {
            if (error.isAuthError) return false;
            return failureCount < 2;
        },
        ...restOptions,
    });

    useEffect(() => {
        if (redirectToLogin && result.isError) {
            logout();
        }
    }, [result.isError, redirectToLogin, logout]);

    return result as UseQueryResult<TData, ApiRequestError>;
}
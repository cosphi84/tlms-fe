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
import { clearAuthCookies, setAuthCookies } from "@/helpers/auth-helper";
import { getQueryString } from "@/queries/url-query";
import { type Query } from "@/types/query-interface"; // ✅ import Query type

// ─── Constants ────────────────────────────────────────────────────────────────

const QUERY_KEYS = {
    auth: ["USER", "BY-TOKEN"] as const,
    login: ["LOGIN"] as const,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseGetAuthOptions<TCache, TError, TData>
    extends UseQueryOptions<TCache, TError, TData> {
    redirectToLogin?: boolean;
    query?: Query; // ✅ was Record<string, unknown> — now matches getQueryString param
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
            if (!Cookies.get("tlms_token")) return;

            localStorage.clear();
            clearAuthCookies();
            void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.login });

            const redirectTarget =
                currentPath ??
                encodeURIComponent(window.location.pathname + window.location.search);

            window.location.href = `/login?prev=${redirectTarget}`;
            callback?.();
        },
        [queryClient, currentPath]
    );
}

export function useGetAuth<TData = UserProps>(
    options?: Partial<UseGetAuthOptions<UserProps, ApiRequestError, TData>>
): UseQueryResult<TData, ApiRequestError> {
    const { redirectToLogin = true, query, ...restOptions } = options ?? {};
    const pathname = usePathname();
    const logout = useLogout(pathname);

    const result = useQuery<UserProps, ApiRequestError, TData>({
        queryKey: QUERY_KEYS.auth,
        queryFn: async () => {
            const axios = createBrowserInstance();
            const qs = query ? `?${getQueryString(query)}` : "";
            return axios.get<UserProps>(`/user${qs}`);
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
import { type LoginResponse } from "@/types/user-interface";
import Cookies from "js-cookie";

// ─── Cookie names ─────────────────────────────────────────────────────────────

export const COOKIE_NAMES = {
    accessToken: "tlms_access_token",
    refreshToken: "tlms_refresh_token",
    user: "tlms_user",
} as const;

// ─── Cookie options ───────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production";

/** Access token: 15 minutes (matches BE expiry) */
const ACCESS_TOKEN_OPTIONS: Cookies.CookieAttributes = {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    sameSite: "lax",
    secure: isProduction,
};

/** Refresh token: 7 days */
const REFRESH_TOKEN_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    sameSite: "lax",
    secure: isProduction,
};

/** User profile cookie: 7 days (mirrors refresh token lifetime) */
const USER_COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 7,
    sameSite: "lax",
    secure: isProduction,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function setAuthCookies(data: Pick<LoginResponse, "access_token" | "refresh_token" | "user">): void {
    Cookies.set(COOKIE_NAMES.accessToken, data.access_token, {
        ...ACCESS_TOKEN_OPTIONS,
        expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    Cookies.set(COOKIE_NAMES.refreshToken, data.refresh_token, REFRESH_TOKEN_OPTIONS);
    Cookies.set(
        COOKIE_NAMES.user,
        btoa(encodeURIComponent(JSON.stringify(data.user))),
        USER_COOKIE_OPTIONS
    );
}

export function rotateAccessToken(accessToken: string, refreshToken: string): void {
    Cookies.set(COOKIE_NAMES.accessToken, accessToken, {
        ...ACCESS_TOKEN_OPTIONS,
        expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    // Always update refresh token too (rotation)
    Cookies.set(COOKIE_NAMES.refreshToken, refreshToken, REFRESH_TOKEN_OPTIONS);
}

export function clearAuthCookies(): void {
    Cookies.remove(COOKIE_NAMES.accessToken);
    Cookies.remove(COOKIE_NAMES.refreshToken);
    Cookies.remove(COOKIE_NAMES.user);
}

export function getAccessToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.accessToken);
}

export function getRefreshToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.refreshToken);
}

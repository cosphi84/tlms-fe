import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { nodeParseJwt, isTokenExpired } from "@/lib/jwt";

const publicPathnames = ["/login"];

// ─── Cookie names (must stay in sync with auth-helper.ts) ────────────────────
const COOKIE = {
    access: "tlms_access_token",
    refresh: "tlms_refresh_token",
    user: "tlms_user",
} as const;

// ─── Proactive refresh (server-side, inside middleware) ───────────────────────
//
// We call the BE from inside the middleware when the access token is missing
// or has < 60s left. This happens BEFORE the response reaches the browser,
// so there is zero UI flicker — the new token is attached to the response
// cookie before any client sees a 401.
//

const apiHost = process.env["NEXT_PUBLIC_TLMS_BACKEND_API"];

async function tryRefreshFromMiddleware(
    refreshToken: string
): Promise<{ access_token: string; refresh_token: string } | null> {
    try {
        const res = await fetch(`${apiHost}auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshToken}`,
            },
            // Edge-safe: no keep-alive, short timeout
            signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return null;
        return res.json() as Promise<{ access_token: string; refresh_token: string }>;
    } catch {
        return null;
    }
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setTokenCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
) {
    const isProduction = process.env.NODE_ENV === "production";

    response.cookies.set(COOKIE.access, accessToken, {
        maxAge: 15 * 60, // 15 minutes
        sameSite: "lax",
        secure: isProduction,
        path: "/",
    });
    response.cookies.set(COOKIE.refresh, refreshToken, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        sameSite: "lax",
        secure: isProduction,
        path: "/",
    });
}

function clearTokenCookies(response: NextResponse) {
    response.cookies.delete(COOKIE.access);
    response.cookies.delete(COOKIE.refresh);
    response.cookies.delete(COOKIE.user);
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    const buildCurrentPath = () =>
        encodeURI(`${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`);

    const loginRedirect = (response?: NextResponse) => {
        const res = NextResponse.redirect(
            new URL(`/login?prev=${buildCurrentPath()}`, request.url)
        );
        if (response) clearTokenCookies(res);
        return res;
    };

    const accessCookie = request.cookies.get(COOKIE.access);
    const refreshCookie = request.cookies.get(COOKIE.refresh);
    const now = Math.floor(Date.now() / 1000);

    const decodedAccess = accessCookie?.value
        ? nodeParseJwt(accessCookie.value)
        : null;

    // ── Is access token valid and has > 60s left? ────────────────────────────
    const accessValid =
        decodedAccess &&
        !isTokenExpired(decodedAccess, 60); // 60s buffer for proactive refresh

    // ── Authenticated user hitting /login → send home ────────────────────────
    if (accessValid && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── Public paths — let through ───────────────────────────────────────────
    if (publicPathnames.includes(pathname)) {
        return NextResponse.next();
    }

    // ── Access token still good → allow ─────────────────────────────────────
    if (accessValid) {
        return NextResponse.next();
    }

    // ── Access token missing/expired → try silent refresh ───────────────────
    if (refreshCookie?.value) {
        const decodedRefresh = nodeParseJwt(refreshCookie.value);
        const refreshValid = decodedRefresh && !isTokenExpired(decodedRefresh);

        if (refreshValid) {
            const tokens = await tryRefreshFromMiddleware(refreshCookie.value);

            if (tokens) {
                // Attach new tokens to the response cookies and let the request through
                const response = NextResponse.next();
                setTokenCookies(response, tokens.access_token, tokens.refresh_token);
                return response;
            }
        }

        // Refresh token also expired / refresh failed
        const res = loginRedirect();
        clearTokenCookies(res);
        return res;
    }

    // ── No tokens at all → redirect to login ────────────────────────────────
    return loginRedirect();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
    ],
};
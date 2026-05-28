import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { nodeParseJwt } from "@/lib/jwt";

const publicPathnames = ["/login"];

export function proxy(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl;

    const buildCurrentPath = () =>
        encodeURI(`${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`);

    const loginRedirect = () =>
        NextResponse.redirect(new URL(`/login?prev=${buildCurrentPath()}`, request.url));

    // Get and validate token
    const token = request.cookies.get("tlms_token");
    const now = Math.floor(Date.now() / 1000);
    const decodedToken = token?.value ? nodeParseJwt(token.value) : null;
    const isTokenValid = decodedToken && now < (decodedToken.exp as number);

    // Authenticated user hitting /login → send home
    if (isTokenValid && pathname === "/login") {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Public paths — let through
    if (publicPathnames.includes(pathname)) {
        return NextResponse.next();
    }

    // Expired token — clear cookie and redirect
    if (token && !isTokenValid) {
        const response = loginRedirect();
        response.cookies.delete("tlms_token"); // fixed typo
        return response;
    }

    // Valid token — allow
    if (isTokenValid) {
        return NextResponse.next();
    }

    // No token — redirect to login
    return loginRedirect();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.[a-zA-Z0-9]+$).*)",
    ],
};
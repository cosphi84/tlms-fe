import { type LoginResponse } from "@/types/user-interface";
import Cookies from "js-cookie";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
    expires: 2,                                          // fixed: was 1 day
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
};

export function setAuthCookies(data: LoginResponse): void {
    Cookies.set("tlms_token", data.token, COOKIE_OPTIONS);
    Cookies.set(
        "tlms_user",
        btoa(encodeURIComponent(JSON.stringify(data.user))),
        COOKIE_OPTIONS
    );
}

export function clearAuthCookies(): void {
    Cookies.remove("tlms_token");
    Cookies.remove("tlms_user");
}
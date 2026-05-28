import { jwtDecode } from "jwt-decode";
import { type CookieUser } from "@/types/user-interface";

/**
 * JWT payload shape from Go backend.
 * Must match claims set in your Go JWT signing logic.
 */
export type JWTProps = {
    id: number;
    email: string;
    name: string;
    role: string;
    office: string;
    exp: number;
    iat: number;
};

/** Safe default — exp/iat = 0 so token is always treated as expired */
export const defaultToken: JWTProps = {
    id: 0,
    email: "",
    name: "",
    role: "",
    office: "",
    exp: 0,
    iat: 0,
};

export const defaultCookieUser: CookieUser = {
    id: 0,
    email: "",
    name: "",
    role: "",
    office: "",
};

/** Client-side JWT decoder — uses jwt-decode library */
export function parseJwt(token: string): JWTProps {
    return jwtDecode<JWTProps>(token);
}

/**
 * Node.js/middleware JWT parser — uses Buffer instead of jwt-decode
 * because Edge middleware runs in a restricted runtime.
 * Does NOT verify signature — only decodes payload.
 */
export function nodeParseJwt(token?: string): JWTProps | null {
    if (!token) return null;
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        return JSON.parse(
            Buffer.from(payload, "base64url").toString()
        ) as JWTProps;
    } catch {
        return null;
    }
}

/**
 * Decode tlms_user cookie value.
 * Encoding: btoa(encodeURIComponent(JSON.stringify(user)))
 * So decoding is the exact reverse.
 */
export function parseCookieUser(encoded?: string): CookieUser | null {
    if (!encoded) return null;
    try {
        return JSON.parse(decodeURIComponent(atob(encoded))) as CookieUser;
    } catch {
        return null;
    }
}
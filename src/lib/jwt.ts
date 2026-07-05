import { jwtDecode } from "jwt-decode";
import { type CookieUser } from "@/types/user-interface";

/**
 * JWT payload shape from Go backend.
 * Must match claims set in your Go JWT signing logic.
 *
 * Access token payload example:
 * { user_id: 1, role: ["superadmin"], office_id: 1, token_type: "access", exp: ..., iat: ... }
 */
export type JWTProps = {
    user_id: number;
    role: string[];
    office_id: number;
    /** "access" | "refresh" */
    token_type: string;
    exp: number;
    iat: number;
};

/** Safe default — exp/iat = 0 so token is always treated as expired */
export const defaultToken: JWTProps = {
    user_id: 0,
    role: [],
    office_id: 0,
    token_type: "",
    exp: 0,
    iat: 0,
};

export const defaultCookieUser: CookieUser = {
    id: 0,
    email: "",
    name: "",
    image: "",
    office_id: 0,
    office: {
        id: 0,
        parent_id: { Int64: 0, Valid: false },
        code: "",
        name: "",
        type: "",
        depth: 0,
        rgt: 0,
        lft: 0,
        children_count: 0,
        created_at: "",
        updated_at: "",
        deleted_at: null,
    },
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

/**
 * Returns true if the token is expired or will expire within `bufferSeconds`.
 */
export function isTokenExpired(token: JWTProps | null, bufferSeconds = 0): boolean {
    if (!token) return true;
    const now = Math.floor(Date.now() / 1000);
    return token.exp <= now + bufferSeconds;
}
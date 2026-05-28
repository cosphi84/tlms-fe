// ─── Auth ─────────────────────────────────────────────────────────────────────

export type LoginArg = {
    email: string;
    password: string;
};

/**
 * Shape returned by POST /login from Go backend.
 * token  → stored in tlms_token cookie
 * user   → stored in tlms_user cookie (base64 encoded)
 */
export type LoginResponse = {
    token: string;
    user: CookieUser;
};

/**
 * Lightweight user shape stored in tlms_user cookie.
 * Sourced directly from LoginResponse.user.
 */
export type CookieUser = {
    id: number;
    email: string;
    name: string;
    role: string;
    office: string;
};

// ─── Full User (from GET /user) ───────────────────────────────────────────────

/**
 * Full user profile returned by GET /user endpoint.
 * Used by useGetAuth hook.
 */
export interface UserProps {
    user_id: number;
    email: string;
    name: string;
    password?: string;
    image?: string;
    office_id: number;
    office?: string;
    role_id: string;
    role: string;
    is_active: boolean;
    failed_login_attempts: number;
    locked_until?: Date;
    last_login_at?: Date;
    last_login_from?: string;
    created_at: Date;
    updated_at?: Date;
}
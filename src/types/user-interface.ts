// ─── Auth ─────────────────────────────────────────────────────────────────────

export type LoginArg = {
    email: string;
    password: string;
};

/**
 * Shape returned by POST /auth from Go backend.
 * access_token  → stored in tlms_access_token cookie (15 min)
 * refresh_token → stored in tlms_refresh_token cookie (7 days)
 * user          → stored in tlms_user cookie (base64 encoded)
 */
export type LoginResponse = {
    access_token: string;
    refresh_token: string;
    user: UserProps;
};

/** Shape returned by POST /auth/refresh */
export type RefreshResponse = {
    access_token: string;
    refresh_token: string;
};

// ─── Office ───────────────────────────────────────────────────────────────────

export type NullableInt64 = {
    Int64: number;
    Valid: boolean;
};

export interface OfficeProps {
    id: number;
    parent_id: NullableInt64;
    code: string;
    name: string;
    type: string;
    depth: number;
    rgt: number;
    lft: number;
    children_count: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

// ─── User ─────────────────────────────────────────────────────────────────────

/**
 * Full user profile returned by BE (nested in LoginResponse.user).
 * Also used as the shape stored in tlms_user cookie.
 */
export interface UserProps {
    id: number;
    email: string;
    name: string;
    image: string;
    office_id: number;
    is_active: boolean;
    failed_login_attempts: number;
    last_login_at: string;
    last_login_from: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    office: OfficeProps;
}

/**
 * Lightweight user shape stored in tlms_user cookie.
 * Sourced directly from LoginResponse.user.
 */
export type CookieUser = {
    id: number;
    email: string;
    name: string;
    image: string;
    office_id: number;
    office: OfficeProps;
};
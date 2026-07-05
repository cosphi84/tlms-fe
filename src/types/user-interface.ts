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
    access_token: string;
    refresh_token: string;
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
    office: bigint;
};

// ─── Full User (from GET /user) ───────────────────────────────────────────────

/**
 * Full user profile returned by GET /user endpoint.
 * Used by useGetAuth hook.
 */
export interface UserProps {
  user_id: bigint;
  email: string;
  name: string;
  image?: string;
  office_id: bigint;
  office?: object;
  is_active: boolean;
  failed_login_attempts: number;
  locked_until?: Date;
  last_login_at?: Date;
  last_login_from?: string;
  created_at: Date;
  updated_at?: Date;
}

import CookieBrowser from "js-cookie";
import { TlmsCfg } from "@/configs/app";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
    _retry?: boolean;
  }
}

export interface ApiRequestError {
  url: string | undefined;
  message: string;
  status: number | string | null;
  response: {
    data: { statusCode: number; message: string };
    status: number;
    statusText: string;
  };
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
  isAuthError: boolean;
  timestamp: string;
}


export interface NullableInt64 {
  Int64: number;
  Valid: boolean;
}

export interface AuthOffice {
  id: number;
  parent_id: NullableInt64;
  code: string;
  name: string;
  type: "hq" | "cabang" | "sdss" | "ssr" | "tc" | "sass";
  depth: number;
  lft: number;
  rgt: number;
  children_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  image: string;
  office_id: number;
  is_active: boolean;
  failed_login_attempts: number;
  last_login_at: string | null;
  last_login_from: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  office: AuthOffice;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token?: string; // some BEs rotate it, some don't — handle both
}

export const tokenStorage = {
  getAccessToken: () => CookieBrowser.get(TlmsCfg.cookieName.accessToken),
  getRefreshToken: () => CookieBrowser.get(TlmsCfg.cookieName.refreshToken),

  setTokens: (accessToken: string, refreshToken: string) => {
    CookieBrowser.set(TlmsCfg.cookieName.accessToken, accessToken, {
      expires: 1, // access token: short-lived, matches BE `exp`
      sameSite: "strict",
    });
    CookieBrowser.set(TlmsCfg.cookieName.refreshToken, refreshToken, {
      expires: 7, // refresh token: longer-lived
      sameSite: "strict",
    });
  },

  setUser: (user: AuthUser) => {
    CookieBrowser.set(TlmsCfg.cookieName.user, JSON.stringify(user), {
      expires: 7,
      sameSite: "strict",
    });
  },

  getUser: (): AuthUser | null => {
    const raw = CookieBrowser.get(TlmsCfg.cookieName.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  saveSession: (payload: LoginResponse) => {
    tokenStorage.setTokens(payload.access_token, payload.refresh_token);
    tokenStorage.setUser(payload.user);
  },

  clear: () => {
    CookieBrowser.remove(TlmsCfg.cookieName.accessToken);
    CookieBrowser.remove(TlmsCfg.cookieName.refreshToken);
    CookieBrowser.remove(TlmsCfg.cookieName.user);
  },
};
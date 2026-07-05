import { ApiRequestError } from "@/lib/axios";

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

export type Instance = ReturnType<typeof createInstance>;

export interface NullableInt64 {
  Int64: number;
  Valid: boolean;
}

import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuid4 } from "uuid";
import CookieBrowser from "js-cookie";

// ─── Config ──────────────────────────────────────────────────────────────────

const apiHost = process.env["NEXT_PUBLpastedlet start build user login and user management module.Start by axioslib.
This is my axios liband my backend now adopt the refresh token and access token like this:{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjpbInN1cGVyYWRtaW4iXSwib2ZmaWNlX2lkIjoxLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgzMjI4MDQzLCJpYXQiOjE3ODMyMjcxNDN9.rJYmeiJmZUVY9lmKsBToJPesV2HG_gF5RhdkRMwmeu4",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlIjpbInN1cGVyYWRtaW4iXSwib2ZmaWNlX2lkIjoxLCJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc4MzgzMTk0MywiaWF0IjoxNzgzMjI3MTQzfQ.FE3XhYt0sPGIZoY8ofI4OWPR3OC1ecWyCVcVuqYd62g",
    "user": {
    "id": 1,
      "email": "risam@seid.sharp-world.com",
      "name": "Risam",
      "image": "",
      "office_id": 1,
      "is_active": true,
      "failed_login_attempts": 0,
      "last_login_at": "2026-07-05T12:52:23.502949612+08:00",
      "last_login_from": "182.253.128.2",
      "created_at": "2026-07-05T12:28:30.608281+08:00",
      "updated_at": "2026-07-05T12:52:23.574238554+08:00",
      "deleted_at": null,
      "office": {
      "id": 1,
        "parent_id": {
        "Int64": 0,
          "Valid": false
      },
      "code": "81",
        "name": "Karawang",
        "type": "hq",
        "depth": 0,
        "rgt": 2,
        "lft": 1,
        "children_count": 0,
        "created_at": "2026-07-05T12:28:30.451825+08:00",
        "updated_at": "2026-07-05T12:28:30.452701+08:00",
        "deleted_at": null
    }
  }
}trim the axios lib to match new be.Show moreArchitected axios interceptor with dual-token refresh mechanism and queue handlingArchitected axios interceptor with dual-token refresh mechanism and queue handlingHere's the trimmed lib. Main changes: split single tlms_token cookie into access_token/refresh_token, added a silent-refresh-on-401 interceptor with request queueing (so 5 parallel 401s don't fire 5 refresh calls — classic race condition, don't ask how I know), and split refresh behavior between browser (auto) and Node/SSR (manual — SSR shouldn't be silently rewriting cookies mid-render).
typescriptimport axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { v4 as uuid4 } from "uuid";
import CookieBrowser from "js-cookie";

// ─── Config ──────────────────────────────────────────────────────────────────

const apiHost = process.env["NEXT_PUBLIC_TLMS_BACKEND_API"];

const cookieName = {
  accessToken: "tlms_access_token",
  refreshToken: "tlms_refresh_token",
  user: "tlms_user",
} as const;

// TODO: confirm actual route with BE team — assumed for now.
const REFRESH_ENDPOINT = "/auth/refresh";

export const axiosMultiPartConfig: AxiosRequestConfig = {
  headers: { "Content-Type": "multipart/form-data" },
};

// ─── Types ───────────────────────────────────────────────────────────────────

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

export type Instance = ReturnType<typeof createInstance>;

// Mirrors Go's sql.NullInt64 JSON shape — reuse this wherever a nullable FK
// comes back from the BE (office.parent_id being the obvious one).
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
  getAccessToken: () => CookieBrowser.get(cookieName.accessToken),
  getRefreshToken: () => CookieBrowser.get(cookieName.refreshToken),

  setTokens: (accessToken: string, refreshToken: string) => {
    CookieBrowser.set(cookieName.accessToken, accessToken, {
      expires: 1, // access token: short-lived, matches BE `exp`
      sameSite: "strict",
    });
    CookieBrowser.set(cookieName.refreshToken, refreshToken, {
      expires: 7, // refresh token: longer-lived
      sameSite: "strict",
    });
  },

  setUser: (user: AuthUser) => {
    CookieBrowser.set(cookieName.user, JSON.stringify(user), {
      expires: 7,
      sameSite: "strict",
    });
  },

  getUser: (): AuthUser | null => {
    const raw = CookieBrowser.get(cookieName.user);
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
    CookieBrowser.remove(cookieName.accessToken);
    CookieBrowser.remove(cookieName.refreshToken);
    CookieBrowser.remove(cookieName.user);
  },
};
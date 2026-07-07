import { OfficeType } from "@/schemas/office-schema";

// ── NullableInt64 ─────────────────────────────────────────────

export interface NullableInt64 {
  Int64: number;
  Valid: boolean;
}

// ── Office ────────────────────────────────────────────────────

export interface OfficeResponse {
  id: number;
  parent_id: NullableInt64;
  code: string;
  name: string;
  type: string;
  depth: number;
  lft: number;
  rgt: number;
  children_count: number;

  created_by?: number;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// dropdown

export interface SelectOfficeResponses {
  id: number | null;
  label: string;
}

// requests

export interface CreateOfficePayload {
  parent_id: number | null;
  code: string;
  name: string;
  type: OfficeType;
}

// wrappers

export interface DataWrapper<T> {
  data: T;
}

export interface MessageResponse {
  message: string;
}
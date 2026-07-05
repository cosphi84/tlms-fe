// ── Pagination ────────────────────────────────────────────────
import { OfficeType } from "@/schemas/office-schema";

export interface PaginationRequest {
  page?: number;
  limit?: number;
  search?: string;
  sorted_by?: string;
  sort_dir?: "asc" | "desc";
}

export interface PaginationResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total_rows: number;
  total_pages: number;
}

// ── Office ────────────────────────────────────────────────────
export interface OfficeResponse {
  id: number;
  parent_id?: {
    Int64: number;
    Valid: boolean;
  };

  code: string;
  name: string;
  type: string;
  depth: number;

  lft: number;
  rgt: number;

  children_count: number;
}

// For <Select> / combobox dropdowns
export interface SelectOfficeResponses {
  id: number;
  label: string;
}

// ── Requests ──────────────────────────────────────────────────
export interface CreateOfficePayload {
  parent_id: number; // number on wire — converted from form string
  code: string; // max 10 chars
  name: string; // max 100 chars
  type: OfficeType;
}

// ── API Response Wrappers ─────────────────────────────────────
// Handlers that wrap in { data: ... }
export interface DataWrapper<T> {
  data: T;
}

// Handlers that return { message: ... }
export interface MessageResponse {
  message: string;
}

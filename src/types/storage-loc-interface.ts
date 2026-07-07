import { OfficeResponse } from "@/types/office-interface";

export interface StorageLocRespons {
  id: number;
  code: string;
  name: string;
  office_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  delete_at: string | null;
  office: OfficeResponse;
}

export interface CreateStorageLocPayload {
  code: string;
  name: string;
  office_id: number;
}

export interface MessageResponse {
  message: string;
}

export interface SlocPaginatedResponse {
  data: StorageLocRespons[];
  page: number;
  limit: number;
  total_rows: number;
  total_pages: number;
}
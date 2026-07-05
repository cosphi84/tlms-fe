// ============================================================
// src/queries/office-queries.ts
// TanStack Query v5 — queries + mutations for /office endpoints
// ============================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData
} from "@tanstack/react-query";
import { createBrowserInstance } from "@/lib/axios";
import type {
  CreateOfficePayload,
  DataWrapper,
  MessageResponse,
  OfficeResponse,
  PaginationRequest,
  PaginationResponse,
  SelectOfficeResponses
} from "@/types/office-interface";

// ─── Axios instance ───────────────────────────────────────────
// createBrowserInstance() reads JWT from cookie automatically.
// Called inside each fn — not at module level — so it always
// picks up the latest token (no stale closure after re-login).
const api = () => createBrowserInstance();

const BASE = "/office";

// ============================================================
// ── Query Key Factory ─────────────────────────────────────────
// Centralised → no magic strings scattered across components.
// Structure follows the TanStack recommended hierarchy:
//   [entity, scope, ...params]
// ============================================================
export const officeKeys = {
  all: ["offices"] as const,

  roots: (params: PaginationRequest) =>
    [...officeKeys.all, "roots", params] as const,

  list: () => [...officeKeys.all, "list"] as const,

  options: () => [...officeKeys.all, "options"] as const,

  children: (parentId: number) =>
    [...officeKeys.all, "children", parentId] as const
};

// ============================================================
// ── Raw API Functions ─────────────────────────────────────────
// Kept co-located with hooks intentionally — this is a
// feature-level file, not a global API layer.
// Your axios interceptor already unwraps response.data,
// so return type = T directly (no { data } destructure).
// ============================================================

async function getRootOffices(
  params: PaginationRequest
): Promise<PaginationResponse<OfficeResponse>> {
  return api().get<PaginationResponse<OfficeResponse>>(BASE, { params });
}

async function getAllOffices(
): Promise<OfficeResponse[]> {
  return api().get<OfficeResponse[]>(`${BASE}/all`);
}

async function getOfficeOptions(): Promise<SelectOfficeResponses[]> {
  // Handler returns { data: SelectOfficeResponses[] }
  const res = await api().get<DataWrapper<SelectOfficeResponses[]>>(
    `${BASE}/options`
  );
  return res.data;
}

async function getOfficeChildren(parentId: number): Promise<OfficeResponse[]> {
  // Handler returns { data: OfficeResponse[] }
  const res = await api().get<DataWrapper<OfficeResponse[]>>(
    `${BASE}/${parentId}/children`
  );
  return res.data;
}

async function postCreateOffice(
  payload: CreateOfficePayload
): Promise<MessageResponse> {
  // Handler returns { message: "office created" }
  return api().post<MessageResponse>(`${BASE}/new`, payload);
}

async function deleteOfficeById(
  officeId: number
): Promise<DataWrapper<string>> {
  // Handler returns { data: "office deleted" }
  return api().delete<DataWrapper<string>>(`${BASE}/${officeId}`);
}

// ============================================================
// ── Query Hooks ───────────────────────────────────────────────
// ============================================================

/**
 * GET /office
 * Paginated root-level offices.
 * keepPreviousData → table stays visible during page/filter change.
 */
export function useRootOffices(params: PaginationRequest) {
  return useQuery({
    queryKey: officeKeys.roots(params),
    queryFn: () => getRootOffices(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000
  });
}

/**
 * GET /office/all
 * Paginated full office list — all depths.
 * Used for admin/full-browser views.
 */
export function useAllOffices() {
  return useQuery({
    queryKey: officeKeys.list(),
    queryFn: getAllOffices,
    staleTime: 30_000
  });
}

/**
 * GET /office/options
 * Flat list for <Select> / combobox.
 * Long staleTime — option lists rarely change mid-session.
 * All forms on the page share one fetch via shared cache key.
 */
export function useOfficeOptions() {
  return useQuery({
    queryKey: officeKeys.options(),
    queryFn: getOfficeOptions,
    staleTime: 5 * 60_000 // 5 min
  });
}

/**
 * GET /office/:parentId/children
 * Disabled when parentId is falsy — safe to call unconditionally
 * before the user selects a parent node.
 */
export function useOfficeChildren(parentId: number | undefined) {
  return useQuery({
    queryKey: officeKeys.children(parentId ?? 0),
    queryFn: () => getOfficeChildren(parentId!),
    enabled: !!parentId,
    staleTime: 30_000
  });
}

// ============================================================
// ── Mutation Hooks ────────────────────────────────────────────
// ============================================================

/**
 * POST /office/new  [admin only]
 *
 * Note: OfficeFormValue.parent_id is string (from <Select>).
 * Convert to number here before sending to wire.
 *
 * On success → invalidates all office cache subtrees so lists,
 * options, and children all refetch automatically.
 *
 * Toast is handled globally by MutationCache in QueryProvider —
 * no need to call toast() here.
 *
 * Usage:
 *   const { mutate, isPending } = useCreateOffice();
 *   mutate({ parent_id: "1", code: "JKT", name: "Jakarta", type: "cabang" });
 */
export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfficePayload) => postCreateOffice(payload),

    onSuccess: (_data, variables) => {
      // Invalidate all paginated lists + options
      queryClient.invalidateQueries({ queryKey: officeKeys.all });

      // Targeted: also refresh parent's children list for tree views
      queryClient.invalidateQueries({
        queryKey: officeKeys.children(variables.parent_id)
      });
    }
  });
}

/**
 * DELETE /office/:officeId  [admin only]
 *
 * Optimistic update pattern:
 *  1. Cancel in-flight queries
 *  2. Snapshot current children cache
 *  3. Optimistically remove item from children list
 *  4. On error → rollback to snapshot
 *  5. On settle → invalidate for server sync
 *
 * Usage:
 *   const { mutate, isPending } = useDeleteOffice();
 *   mutate({ officeId: 42, parentId: 5 });
 *   // parentId is optional — pass it when deleting from a tree view
 */
export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ officeId }: { officeId: number; parentId?: number }) =>
      deleteOfficeById(officeId),

    onMutate: async ({ officeId, parentId }) => {
      // Cancel any outgoing refetches (avoid overwriting optimistic state)
      await queryClient.cancelQueries({ queryKey: officeKeys.all });

      // Snapshot for rollback
      const previousChildren = parentId
        ? queryClient.getQueryData<OfficeResponse[]>(
            officeKeys.children(parentId)
          )
        : undefined;

      // Optimistic remove from children cache
      if (parentId) {
        queryClient.setQueryData<OfficeResponse[]>(
          officeKeys.children(parentId),
          (old) => old?.filter((o) => o.id !== officeId) ?? []
        );
      }

      return { previousChildren, parentId };
    },

    onError: (_err, _vars, context) => {
      // Rollback children cache to snapshot
      if (context?.previousChildren !== undefined && context.parentId) {
        queryClient.setQueryData(
          officeKeys.children(context.parentId),
          context.previousChildren
        );
      }
      // Global toast handled by MutationCache.onError in QueryProvider
    },

    onSettled: () => {
      // Always sync with server truth after any outcome
      queryClient.invalidateQueries({ queryKey: officeKeys.all });
    }
  });
}
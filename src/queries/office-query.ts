import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { createBrowserInstance } from "@/lib/axios";

import type {
  CreateOfficePayload,
  DataWrapper,
  MessageResponse,
  OfficeResponse,
  SelectOfficeResponses
} from "@/types/office-interface";

const api = () => createBrowserInstance();

const BASE = "/offices";

// ============================================================
// Query Keys
// ============================================================

export const officeKeys = {
  all: ["offices"] as const,

  list: () => [...officeKeys.all, "list"] as const,

  options: () => [...officeKeys.all, "options"] as const,

  children: (parentId: number| null) =>
    [...officeKeys.all, "children", parentId] as const
};

// ============================================================
// API
// ============================================================

async function getOffices(): Promise<OfficeResponse[]> {
  return api().get<OfficeResponse[]>(BASE);
}

async function getOfficeOptions(): Promise<SelectOfficeResponses[]> {
  return api().get<SelectOfficeResponses[]>(`${BASE}/options`);
}

async function getOfficeChildren(parentId: number): Promise<OfficeResponse[]> {
  const res = await api().get<DataWrapper<OfficeResponse[]>>(
    `${BASE}/${parentId}/children`
  );

  return res.data;
}

async function postCreateOffice(
  payload: CreateOfficePayload
): Promise<MessageResponse> {
  return api().post<MessageResponse>(BASE, payload);
}

async function deleteOfficeById(
  officeId: number
): Promise<DataWrapper<string>> {
  return api().delete<DataWrapper<string>>(`${BASE}/${officeId}`);
}

// ============================================================
// Queries
// ============================================================

export function useOffices() {
  return useQuery({
    queryKey: officeKeys.list(),
    queryFn: getOffices,
    staleTime: 30_000,
    refetchOnMount: true,
  });
}

export function useOfficeOptions() {
  return useQuery({
    queryKey: officeKeys.options(),
    queryFn: getOfficeOptions,
    staleTime: 5 * 60_000
  });
}

export function useOfficeChildren(parentId: number | undefined) {
  return useQuery({
    queryKey: officeKeys.children(parentId ?? 0),
    queryFn: () => getOfficeChildren(parentId!),
    enabled: !!parentId,
    staleTime: 30_000
  });
}

// ============================================================
// Mutations
// ============================================================

export function useCreateOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCreateOffice,


    onSuccess: (_data, variables) => {

      queryClient.invalidateQueries({
        queryKey: officeKeys.all
      });

      queryClient.invalidateQueries({
        queryKey: officeKeys.children(variables.parent_id)
      });
    }
  });
}

export function useDeleteOffice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ officeId }: { officeId: number; parentId?: number }) =>
      deleteOfficeById(officeId),

    onMutate: async ({ officeId, parentId }) => {
      await queryClient.cancelQueries({
        queryKey: officeKeys.all
      });

      const previousChildren = parentId
        ? queryClient.getQueryData<OfficeResponse[]>(
            officeKeys.children(parentId)
          )
        : undefined;

      if (parentId) {
        queryClient.setQueryData<OfficeResponse[]>(
          officeKeys.children(parentId),
          (old) => old?.filter((o) => o.id !== officeId) ?? []
        );
      }

      return {
        previousChildren,
        parentId
      };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousChildren !== undefined && context.parentId) {
        queryClient.setQueryData(
          officeKeys.children(context.parentId),
          context.previousChildren
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: officeKeys.all
      });
    }
  });
}

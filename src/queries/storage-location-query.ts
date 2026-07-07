import { createBrowserInstance } from "@/lib/axios";
import {
  CreateStorageLocPayload,
  SlocPaginatedResponse,
  StorageLocRespons
} from "@/types/storage-loc-interface";
import { MessageResponse } from "@/interface/general-interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const api = () => createBrowserInstance()
const ENDPOINT = "slocs"

export const SlocKeys = {
  all: ["sloc"] as const,
  list: () => [...SlocKeys.all, "list"] as const,
};

async function getSLocs(): Promise<SlocPaginatedResponse> {
  return api().get<SlocPaginatedResponse>(ENDPOINT);
}

async function postCreateSloc(payload: CreateStorageLocPayload): Promise<MessageResponse> {
  return api().post<MessageResponse>(ENDPOINT, payload);
}


export function useStorageLocation() {
  return useQuery({
    queryKey: SlocKeys.list(),
    queryFn: getSLocs,
    staleTime: 30_000,
    refetchOnMount: true,
  });
}

export function useCreateStorageLoc() {
  const queryCLient = useQueryClient();

  return useMutation({
    mutationFn: postCreateSloc,

    onSuccess: () => {
      queryCLient.invalidateQueries({
        queryKey: SlocKeys.all
      });
    }
  });
}
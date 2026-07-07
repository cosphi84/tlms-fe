import {z} from 'zod'
import { CreateStorageLocPayload } from "@/types/storage-loc-interface";

export const StorageLocSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Storage Location code minimal 2 characters")
    .max(10, "Storage Location name maximal 10 characters")
    .toUpperCase(),

  name: z
    .string()
    .trim()
    .min(2, "Storage Location name minimal 2 characters")
    .max(100, "Storage Location name maximal 10 characters")
    .toUpperCase(),

  office_id: z.number(),
});

export type StorageLocationFormValue = z.infer<typeof StorageLocSchema>;

export const StorageLocationFormDefaultValue: StorageLocationFormValue = {
  code: "",
  name: "",
  office_id: 0,
}

export function toCreateSlocPayload(form: StorageLocationFormValue): CreateStorageLocPayload{
  return {
    name: form.name,
    code: form.code,
    office_id: form.office_id
  };
}
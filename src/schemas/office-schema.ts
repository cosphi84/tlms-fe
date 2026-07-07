import { z } from "zod";
import type { CreateOfficePayload } from "@/types/office-interface";

export const OFFICE_TYPES = {
  tc: "tc",
  cabang: "cabang",
  sdss: "sdss",
  ssr: "ssr",
  sass: "sass",
} as const;

// HQ is kept as a type constant for display purposes but NOT selectable in the form
//export const HQ_TYPE = "hq" as const;

export type OfficeType = (typeof OFFICE_TYPES)[keyof typeof OFFICE_TYPES];

export const OfficeSchema = z.object({
  // Form <Select> yields string — coerce to number for the wire payload
  // Empty string "" means no parent selected (root office)
  parent_id : z.number().optional(),
  // Backend: max=10
  code: z
    .string()
    .trim()
    .min(2, "Office code minimal 2 characters")
    .max(10, "Office code maximal 10 characters")
    .toUpperCase(),

  // Backend: max=100
  name: z
    .string()
    .min(2, "Office name minimal 2 characters")
    .max(100, "Office name maximal 100 characters")
    .toUpperCase(),

  // Must match backend enum exactly (hq excluded from form)
  type: z.enum(["tc", "cabang", "sdss", "ssr", "sass"] as const, {
    error: "Please select an office type",
  }),
});

export type OfficeFormValue = z.infer<typeof OfficeSchema>;

export const OfficeFormDefaultValue: OfficeFormValue = {
  parent_id: 0,
  code: "",
  name: "",
  type: "tc",
};

// ── Helper: convert form values → wire payload ─────────────────
export function toCreateOfficePayload(
  form: OfficeFormValue
): CreateOfficePayload {
  return {
    parent_id: form.parent_id ? Number(form.parent_id) : 0,
    code: form.code,
    name: form.name,
    type: form.type as OfficeType,
  };
}

export const OFFICE_TYPE_OPTIONS = [
  { value: "tc",     label: "Technical Center" },
  { value: "cabang", label: "Cabang" },
  { value: "sdss",   label: "SDSS" },
  { value: "ssr",    label: "SSR" },
  { value: "sass",   label: "SASS" },
] as const;
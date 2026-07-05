import { z } from "zod";
import type { CreateOfficePayload } from "@/types/office-interface";

export const OFFICE_TYPES = {
  hq: "hq",
  tc: "tc",
  cabang: "cabang",
  sdss: "sdss",
  ssr: "ssr",
  sass: "sass"
} as const;

export type OfficeType = (typeof OFFICE_TYPES)[keyof typeof OFFICE_TYPES];

export const OfficeSchema = z.object({
  // Form <Select> yields string — coerce to number for the wire payload
  parent_id: z.string().regex(/^\d+$/, "Invalid parent office"),

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

  // Must match backend enum exactly
  type: z.enum(OFFICE_TYPES)
});

export type OfficeFormValue = z.infer<typeof OfficeSchema>;

export const OfficeFormDefaultValue: OfficeFormValue = {
  parent_id: "",
  code: "",
  name: "",
  type: "cabang"
};

// ── Helper: convert form values → wire payload ─────────────────
// parent_id in form is string (from <Select value>),
// backend expects number. Do the conversion here, not in the component.

export function toCreateOfficePayload(
  form: OfficeFormValue
): CreateOfficePayload {
  return {
    parent_id: Number(form.parent_id),
    code: form.code,
    name: form.name,
    type: form.type
  };
}

export const OFFICE_TYPE_OPTIONS = [
  {
    value: "hq",
    label: "Head Quarter"
  },
  {
    value: "tc",
    label: "Technical Center"
  },
  {
    value: "cabang",
    label: "Cabang"
  },
  {
    value: "sdss",
    label: "SDSS"
  },
  {
    value: "ssr",
    label: "SSR"
  },
  {
    value: "sass",
    label: "SASS"
  }
] as const;
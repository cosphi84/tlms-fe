"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/atoms/select";
import { Skeleton } from "@/components/atoms/skeleton";

import type { SelectOfficeResponses } from "@/types/office-interface";
import { useOfficeOptions } from "@/queries/office-query";

// ─── Props ────────────────────────────────────────────────────
interface OfficeParentSelectProps {
  /** Controlled value — pass field.value from react-hook-form Controller */
  value: string;
  /** onChange handler — pass field.onChange from Controller */
  onChange: (value: string) => void;
  /** Optional: custom filter fn on the options list */
  filter?: (option: SelectOfficeResponses) => boolean;
  /** Forwarded to Select disabled state */
  disabled?: boolean;
  /** Placeholder text inside trigger */
  placeholder?: string;
  /** aria-label for accessibility */
  "aria-label"?: string;
  /** aria-invalid for form validation state */
  "aria-invalid"?: boolean;
  /** HTML id — wire up to FieldLabel htmlFor */
  id?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────
function SelectSkeleton() {
  return (
    <div className="space-y-1">
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────
export function OfficeParentSelect({
  value,
  onChange,
  disabled = false,
  placeholder = "Select parent office",
  id,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid
}: OfficeParentSelectProps) {
  const { data: offices, isLoading, isError } = useOfficeOptions();

  // Loading state → skeleton (not a disabled select, per your preference)
  if (isLoading) return <SelectSkeleton />;

  // Error state → disabled trigger with message
  if (isError) {
    return (
      <div
        className="
        flex h-9 w-full items-center
        rounded-md border border-destructive/50
        bg-muted px-3 text-sm
        text-muted-foreground
      "
      >
        Failed to load offices
      </div>
    );
  }

  const hasOptions = (offices?.length ?? 0) > 0;
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || !hasOptions}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel ?? "Select parent office"}
        aria-invalid={ariaInvalid}
      >
        <SelectValue
          placeholder={hasOptions ? placeholder : "No parent office available"}
        />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Parent Office</SelectLabel>
          {offices?.map((office) => (
            <SelectItem key={office.id} value={String(office.id)}>
              {office.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

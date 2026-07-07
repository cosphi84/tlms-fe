"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Skeleton } from "@/components/atoms/skeleton";

import type { SelectOfficeResponses } from "@/types/office-interface";
import { useOfficeOptions } from "@/queries/office-query";

// ─── Props ────────────────────────────────────────────────────

interface OfficeParentSelectProps {
  /** Controlled value — pass field.value from react-hook-form Controller */
  value: number | null;
  /** onChange handler — pass field.onChange from Controller */
  onChange: (value: number | null) => void;
  /** Optional: custom filter fn on the options list */
  filter?: (option: SelectOfficeResponses) => boolean;
  /** Forwarded to Select disabled state */
  disabled?: boolean;
  /** Placeholder text inside trigger */
  placeholder?: string;
  /** If true, shows a "None (root office)" option at the top */
  allowEmpty?: boolean;
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
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export function OfficeParentSelect({
  value,
  onChange,
  filter,
  disabled = false,
  placeholder = "Select parent office…",
  allowEmpty = false,
  id,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: OfficeParentSelectProps) {
  const { data: offices, isLoading, isError } = useOfficeOptions();
  const ROOT = "__ROOT__";

  // Loading state → skeleton
  if (isLoading) return <SelectSkeleton />;

  // Error state → disabled trigger with message
  if (isError) {
    return (
      <div className="flex h-8 w-full items-center rounded-lg border border-destructive/50 bg-muted px-3 text-sm text-muted-foreground">
        Failed to load offices
      </div>
    );
  }

  const options = filter ? (offices ?? []).filter(filter) : (offices ?? []);
  const hasOptions = options.length > 0;

  return (
    <Select
      value={value == null ? ROOT : value.toString()}
      onValueChange={(v) => onChange( v == ROOT ? null : Number(v))}
      disabled={disabled || (!allowEmpty && !hasOptions)}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel ?? "Select parent office"}
        aria-invalid={ariaInvalid}
        className="w-full"
      >
        <SelectValue
          placeholder={
            hasOptions || allowEmpty
              ? placeholder
              : "No parent office available"
          }
        />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Parent Office</SelectLabel>

          {/* "None" option for root offices */}
          {allowEmpty && (
            <SelectItem value={ROOT}>
              <span className="text-muted-foreground italic">
                None (root office)
              </span>
            </SelectItem>
          )}

          {options.map((office) => (
            <SelectItem key={office.id} value={String(office.id)}>
              {office.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

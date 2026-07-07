"use client";

import { Controller, useForm } from "react-hook-form";
import {
  OFFICE_TYPE_OPTIONS,
  OfficeFormDefaultValue,
  OfficeFormValue,
  OfficeSchema,
  toCreateOfficePayload,
} from "@/schemas/office-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { OfficeParentSelect } from "@/components/cells/select-parent-office";
import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { OfficeTypeBadge } from "@/components/atoms/office-type-badge";
import { useCreateOffice } from "@/queries/office-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Save,
} from "lucide-react";
import React from "react";

// ─── Type ─────────────────────────────────────────────────────────────────────

interface OfficeFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OfficeForm({ className, onSuccess, ...props }: OfficeFormProps) {
  const router = useRouter();
  const createOffice = useCreateOffice();

  const form = useForm<OfficeFormValue>({
    resolver: zodResolver(OfficeSchema),
    defaultValues: OfficeFormDefaultValue,
  });

  const watchedType = form.watch("type");

  const onSubmit = async (values: OfficeFormValue) => {
    try {
      const payload = toCreateOfficePayload(values);
      await createOffice.mutateAsync(payload);
      toast.success("Office created successfully!", {
        description: `${values.name} (${values.code}) has been registered.`,
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      form.reset();
      onSuccess?.();
      router.push("/masters/offices");
    } catch {
      // Error toast handled globally by MutationCache — nothing to do here
    }
  };

  const handleReset = () => {
    form.reset();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl border shadow-sm">
        {/* ── Header ── */}
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">New Office</CardTitle>
              <CardDescription className="text-sm">
                Register a new office into the organization hierarchy
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* ── Form body ── */}
        <CardContent className="pt-6">
          <form
            id="frm-new-office"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-0"
            noValidate
          >
            <FieldGroup>
              {/* ── Office Type ── */}
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="frm-office-type">
                      <span>Office Type</span>
                      <span className="ml-1 text-destructive">*</span>
                    </FieldLabel>

                    <div className="space-y-2">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          id="frm-office-type"
                          aria-invalid={fieldState.invalid}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select office type…" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Office Type</SelectLabel>
                            {OFFICE_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-2">
                                  <OfficeTypeBadge type={opt.value} />
                                  <span>{opt.label}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {/* Live preview of selected type */}
                      {watchedType && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          Selected:&nbsp;
                          <OfficeTypeBadge type={watchedType} />
                        </p>
                      )}
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />


              <Controller
                name="parent_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="frm-office-parent">
                      <span>Parent Office</span>
                      <span className="ml-1 text-xs text-muted-foreground font-normal">
                        (optional for root offices)
                      </span>
                    </FieldLabel>

                    <OfficeParentSelect
                      id="frm-office-parent"
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      placeholder="Select parent office…"
                      allowEmpty
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ── Office Code ── */}
              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="frm-office-code">
                      <span>Office Code</span>
                      <span className="ml-1 text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="frm-office-code"
                      type="text"
                      placeholder="e.g. 81A1"
                      aria-invalid={fieldState.invalid}
                      aria-label="Office Code"
                      className="font-mono uppercase"
                      maxLength={10}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Max 10 characters. Will be auto-uppercased.
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ── Office Name ── */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="frm-office-name">
                      <span>Office Name</span>
                      <span className="ml-1 text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="frm-office-name"
                      type="text"
                      placeholder="e.g. TECHNICAL CENTER"
                      aria-invalid={fieldState.invalid}
                      aria-label="Office Name"
                      className="uppercase"
                      maxLength={100}
                      onChange={(e) =>
                        field.onChange(e.target.value.toUpperCase())
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Max 100 characters. Will be auto-uppercased.
                    </p>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ── Actions ── */}
              <Field orientation="horizontal" className="justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="gap-2"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={createOffice.isPending}
                  className="gap-2"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>

                <Button
                  type="submit"
                  form="frm-new-office"
                  disabled={createOffice.isPending}
                  className="gap-2 min-w-28"
                >
                  {createOffice.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Office
                    </>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
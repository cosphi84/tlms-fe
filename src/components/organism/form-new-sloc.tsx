"use client"

import React, { ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { useCreateStorageLoc } from "@/queries/storage-location-query";
import {
  StorageLocationFormDefaultValue,
  StorageLocationFormValue,
  StorageLocSchema, toCreateSlocPayload
} from "@/schemas/storage-loc-schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Building2, CheckCircle2, Loader2, RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/atoms/field";
import { OfficeParentSelect } from "@/components/cells/select-parent-office";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";

interface SloctFormProps extends ComponentProps<"div"> {
  onSuccess?: () => void;
}

export function SlocForm({ className, onSuccess, ...props }: SloctFormProps) {
  const router = useRouter();
  const createSlock = useCreateStorageLoc()

  const form = useForm<StorageLocationFormValue>({
    resolver: zodResolver(StorageLocSchema),
    defaultValues: StorageLocationFormDefaultValue
  });


  const onSubmit = async (values: StorageLocationFormValue) => {
    try {
      const payload: StorageLocationFormValue = toCreateSlocPayload(values);
      await createSlock.mutateAsync(payload);
      toast.success("New Storage location successfully created!", {
        description: `${values.code} has been registered.`,
        icon: <CheckCircle2 className={"size-4 text-emerald-500"} />,
      });
      form.reset();
      onSuccess?.();
      router.push("/masters/slocs");
    }catch {
      // do nothing
    }
  };

  const handleReset = () => {
    form.reset();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg">New Office</CardTitle>
              <CardDescription className="text-sm">
                Register a new storage locations for technician into hierarchy
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
              <Controller
                name="office_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="frm-office-parent">
                      <span>Office </span>
                      <span className="ml-1 text-xs text-muted-foreground font-normal">
                        (optional for root offices)
                      </span>
                    </FieldLabel>

                    <OfficeParentSelect
                      id="frm-office-parent"
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      placeholder="Select office…"
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
                      <span>SLoc Code</span>
                      <span className="ml-1 text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="frm-office-code"
                      type="text"
                      placeholder="e.g. T81000001"
                      aria-invalid={fieldState.invalid}
                      aria-label="Storage Location Code"
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
                      <span>Technician Name</span>
                      <span className="ml-1 text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id="frm-office-name"
                      type="text"
                      placeholder="e.g. SUTRIMO"
                      aria-invalid={fieldState.invalid}
                      aria-label="Technician Name"
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
                  disabled={createSlock.isPending}
                  className="gap-2"
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>

                <Button
                  type="submit"
                  form="frm-new-office"
                  disabled={createSlock.isPending}
                  className="gap-2 min-w-28"
                >
                  {createSlock.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save SLoc
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
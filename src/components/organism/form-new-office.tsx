"use client"

import { Controller, useForm } from "react-hook-form";
import {
  OFFICE_TYPE_OPTIONS,
  OfficeFormDefaultValue,
  OfficeFormValue,
  OfficeSchema,
  toCreateOfficePayload
} from "@/schemas/office-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/atoms/card";
import { FieldGroup , Field, FieldLabel, FieldError } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { OfficeParentSelect } from "@/components/cells/select-parent-office";
import { Button } from "@/components/atoms/button";
import { SaveIcon } from "lucide-react";
import React from "react";
import { useCreateOffice } from "@/queries/office-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "../atoms/select";

export function OfficeForm({ className, ...props }: React.ComponentProps<"div">) {
  const form = useForm<OfficeFormValue>({
    resolver: zodResolver(OfficeSchema),
    defaultValues: OfficeFormDefaultValue,
  });

  const createOffice = useCreateOffice()

  const onSubmit = async (values: OfficeFormValue) => {
  try{
    const payload = toCreateOfficePayload(values);
    await createOffice.mutateAsync(payload);
    toast.success("Office created successfully.");
    form.reset();
    }catch {
  //nothing to do
}
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="rounded">
        <CardHeader>
          <CardTitle>New Office</CardTitle>
          <CardDescription>Create new office</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={"frm-new-form"}
            onSubmit={form.handleSubmit(onSubmit)}
            className={"space-y-8"}
            noValidate={true}
          >
            <FieldGroup>
              <Controller
                name="type"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="frm-office-type">
                      Office Type
                    </FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        id="frm-office-type"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select office type" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Office Type</SelectLabel>

                          {OFFICE_TYPE_OPTIONS.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={"code"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={"frm-office-code"}>
                      Office Code:
                    </FieldLabel>
                    <Input
                      {...field}
                      id={"frm-office-code"}
                      type={"text"}
                      placeholder="Office Code"
                      aria-invalid={fieldState.invalid}
                      aria-label={"Office Code"}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name={"name"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={"frm-office-name"}>
                      Office Name:
                    </FieldLabel>
                    <Input
                      {...field}
                      id={"frm-office-name"}
                      type={"text"}
                      placeholder="Office Name"
                      aria-invalid={fieldState.invalid}
                      aria-label={"Office Name"}
                    />
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
                      Parent Office
                    </FieldLabel>

                    <OfficeParentSelect
                      id="frm-office-parent"
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field orientation="horizontal" className="justify-center">
                <Button
                  type="submit"
                  form="frm-new-form"
                  disabled={createOffice.isPending}
                  className="bg-primary rounded-md w-1/2 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300"
                >
                  <SaveIcon className="h-6 w-6" />
                  {createOffice.isPending ? "Saving..." : "Save"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    </div>
  );
}
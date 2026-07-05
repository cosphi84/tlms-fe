"use client";

import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/atoms/card";
import Image from "next/image";
import { type LoginFormValues, LoginSchema } from "@/schemas/login-schema";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/atoms/field";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { LogIn } from "lucide-react";
import { useLogin } from "@/queries/auth-query";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const { mutate: login, isPending } = useLogin(); //
    const router = useRouter();
    const searchParams = useSearchParams();         // ✅ Next.js hook, not window.location

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = (values: LoginFormValues) => {  // ✅ not async, mutate not mutateAsync
        login(values, {
             onSuccess: () => {
                const prev = searchParams.get("prev");
                const hash = window.location.hash;  // hash not in searchParams, window is fine here
                const target = prev
                    ? `${decodeURIComponent(prev)}${hash}`
                    : "/dashboard";
                router.push(target);
            },
            // ✅ no onError needed — MutationCache in react-query-provider handles it globally
        });
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}> {/* ✅ removed debug border */}
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardDescription className="flex justify-center">
                        <Image
                            src="/logo-dv2.png"
                            alt="TLMS"
                            width={300}
                            height={150}
                            className="w-auto hidden dark:block"
                            loading="eager"
                            priority
                        />
                        <Image
                            src="/logo-bv2.png"
                            alt="TLMS"
                            width={300}
                            height={150}
                            className="w-auto dark:hidden"
                            loading="eager"
                            priority  // ✅ above-the-fold logo should be priority
                        />
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        id="frm-login"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                        noValidate
                    >
                        <FieldGroup>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="frm-login-email">
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="frm-login-email"
                                            type="email"
                                            placeholder="Your email here"
                                            autoComplete="email"        // ✅ was "off"
                                            aria-invalid={fieldState.invalid}
                                            aria-label="Email"
                                            className="rounded"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="password"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor="frm-login-password">
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id="frm-login-password"
                                            type="password"
                                            placeholder="Password"
                                            autoComplete="current-password"  // ✅ was "off"
                                            aria-invalid={fieldState.invalid}
                                            aria-label="Password"
                                            className="rounded"
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
                                    form="frm-login"
                                    disabled={isPending}  // ✅ prevent double submit
                                    className="bg-primary rounded-md w-1/2 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300"
                                >
                                    <LogIn className="h-6 w-6" />
                                    {isPending ? "Signing in..." : "Log In"}  {/* ✅ loading state */}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>

                <CardFooter>
                    <p className="text-xs text-center w-full">
                        Tools Management System (TLMS) operated by{" "}

                        <a href="mailto:seid_mc-pl@seid.sharp-world.com"
                        target="_blank"
                        rel="noopener noreferrer"  // ✅ security: target="_blank" needs this
                        >
                        SEID CS Planning
                    </a>
                </p>
            </CardFooter>
        </Card>
</div>
);
}
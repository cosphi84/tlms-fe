import { z } from "zod";

export const LoginSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")        // ✅ catches empty string before .email()
        .email("Invalid email address"),
    password: z
        .string()
        .min(1, "Password is required")     // ✅ catches empty string before .min(6)
        .min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
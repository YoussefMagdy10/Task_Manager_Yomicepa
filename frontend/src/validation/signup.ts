import { z } from "zod";

export const signupFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username is too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;

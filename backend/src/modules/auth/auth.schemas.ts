import { z } from "zod";


export const signupSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    // allow letters/digits/_ and ANY whitespace (includes NBSP etc.)
    .regex(/^[a-zA-Z0-9_\s]+$/, "Invalid username")
    // normalize whitespace and trim
    .transform((s) => s.replace(/\s+/g, " ").trim()),
  password: z.string().min(8).max(72),
});



export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

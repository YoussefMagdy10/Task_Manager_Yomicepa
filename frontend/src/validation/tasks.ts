import { z } from "zod";

export const createTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 chars"),
  description: z
    .string()
    .max(5000, "Max 5000 chars")
    .optional()
    .or(z.literal("")),
});

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

export const editTaskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 chars"),
  description: z
    .string()
    .max(5000, "Max 5000 chars")
    .optional()
    .or(z.literal("")),
});

export type EditTaskFormValues = z.infer<typeof editTaskFormSchema>;

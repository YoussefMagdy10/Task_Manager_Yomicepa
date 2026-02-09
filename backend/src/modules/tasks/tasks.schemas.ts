import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
});

export const listTasksQuerySchema = z.object({
  completed: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
});

export const taskIdParamSchema = z.object({
  id: z.string().cuid(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional(),
    completed: z.boolean().optional(),
  })
  .refine((obj) => obj.title !== undefined || obj.description !== undefined || obj.completed !== undefined, {
    message: "At least one field must be provided",
    path: [],
  });

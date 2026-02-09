import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { HttpError } from "../../utils/httpError";
import { createTaskSchema, listTasksQuerySchema, taskIdParamSchema, updateTaskSchema } from "./tasks.schemas";
import * as service from "./tasks.service";

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new HttpError(401, "UNAUTHORIZED");

  const body = createTaskSchema.parse(req.body);

  const task = await service.createTaskForUser(req.auth.userId, {
    title: body.title,
    ...(body.description !== undefined ? { description: body.description } : {}),
  });

  return res.status(201).json({ ok: true, task });
});

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new HttpError(401, "UNAUTHORIZED");

  const query = listTasksQuerySchema.parse(req.query);
  const tasks = await service.listMyTasks(req.auth.userId, query.completed);

  return res.json({ ok: true, tasks });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new HttpError(401, "UNAUTHORIZED");

  const params = taskIdParamSchema.parse(req.params);
  const task = await service.getMyTaskById(req.auth.userId, params.id);

  return res.json({ ok: true, task });
});

export const updateTaskById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new HttpError(401, "UNAUTHORIZED");

  const params = taskIdParamSchema.parse(req.params);
  const body = updateTaskSchema.parse(req.body);

  const task = await service.updateMyTaskById(req.auth.userId, params.id, {
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.completed !== undefined ? { completed: body.completed } : {}),
  });

  return res.json({ ok: true, task });
});

export const deleteTaskById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new HttpError(401, "UNAUTHORIZED");

  const params = taskIdParamSchema.parse(req.params);
  await service.deleteMyTaskById(req.auth.userId, params.id);

  return res.json({ ok: true });
});

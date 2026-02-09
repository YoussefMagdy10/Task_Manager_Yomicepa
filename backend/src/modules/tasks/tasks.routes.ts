import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { createTask, listTasks , deleteTaskById, getTaskById, updateTaskById } from "./tasks.controller";

export const tasksRouter = Router();

tasksRouter.get("/tasks", requireAuth, listTasks);
tasksRouter.post("/tasks", requireAuth, createTask);

tasksRouter.get("/tasks/:id", requireAuth, getTaskById);
tasksRouter.patch("/tasks/:id", requireAuth, updateTaskById);
tasksRouter.delete("/tasks/:id", requireAuth, deleteTaskById);
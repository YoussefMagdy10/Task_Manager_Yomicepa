import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { createTask, listTasks } from "./tasks.controller";

export const tasksRouter = Router();

tasksRouter.get("/tasks", requireAuth, listTasks);
tasksRouter.post("/tasks", requireAuth, createTask);

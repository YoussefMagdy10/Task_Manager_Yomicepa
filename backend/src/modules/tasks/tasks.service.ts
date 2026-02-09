import { HttpError } from "../../utils/httpError";
import * as repo from "./tasks.repository";

export async function createTaskForUser(
  userId: string,
  input: { title: string; description?: string | undefined }
) {
  if (!userId) throw new HttpError(401, "UNAUTHORIZED");

  return repo.createTask({
    userId,
    title: input.title,
    ...(input.description !== undefined ? { description: input.description } : {}),
  });
}

export async function listMyTasks(userId: string, completed?: boolean) {
  if (!userId) throw new HttpError(401, "UNAUTHORIZED");
  return repo.listTasksByUser(userId, completed);
}

export async function getMyTaskById(userId: string, taskId: string) {
  if (!userId) throw new HttpError(401, "UNAUTHORIZED");

  const task = await repo.findTaskByIdAndUser(userId, taskId);
  if (!task) throw new HttpError(404, "TASK_NOT_FOUND");

  return task;
}

export async function updateMyTaskById(
  userId: string,
  taskId: string,
  input: { title?: string; description?: string; completed?: boolean }
) {
  if (!userId) throw new HttpError(401, "UNAUTHORIZED");

  const count = await repo.updateTaskByIdAndUser(userId, taskId, {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.completed !== undefined ? { completed: input.completed } : {}),
  });

  if (count === 0) throw new HttpError(404, "TASK_NOT_FOUND");

  const task = await repo.findTaskByIdAndUser(userId, taskId);
  if (!task) throw new HttpError(404, "TASK_NOT_FOUND");
  return task;
}

export async function deleteMyTaskById(userId: string, taskId: string) {
  if (!userId) throw new HttpError(401, "UNAUTHORIZED");

  const deletedCount = await repo.deleteTaskById(userId, taskId);
  if (deletedCount === 0) throw new HttpError(404, "TASK_NOT_FOUND");
}

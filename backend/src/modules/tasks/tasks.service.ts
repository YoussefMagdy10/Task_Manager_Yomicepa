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

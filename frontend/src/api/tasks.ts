import { http } from "./http";

export type Task = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function listTasks(params?: { completed?: boolean }) {
  const res = await http.get<{ ok: true; tasks: Task[] }>("/api/tasks", {
    params:
      params?.completed === undefined
        ? undefined
        : { completed: String(params.completed) },
  });
  return res.data.tasks;
}

export async function createTask(input: {
  title: string;
  description?: string;
}) {
  const res = await http.post<{ ok: true; task: Task }>("/api/tasks", input);
  return res.data.task;
}

export async function updateTask(
  id: string,
  input: { title?: string; description?: string; completed?: boolean }
) {
  const res = await http.patch<{ ok: true; task: Task }>(
    `/api/tasks/${id}`,
    input
  );
  return res.data.task;
}

export async function deleteTask(id: string) {
  await http.delete<{ ok: true }>(`/api/tasks/${id}`);
}

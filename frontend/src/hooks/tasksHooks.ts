import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import type { Task } from "../api/tasks";
import * as api from "../api/tasks";

const TASKS_KEY = ["tasks"] as const;

export function useTasks(filter?: { completed?: boolean }) {
  return useQuery({
    queryKey:
      filter?.completed === undefined
        ? TASKS_KEY
        : [...TASKS_KEY, { completed: filter.completed }] as const,
    queryFn: () => api.listTasks(filter),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: api.createTask,
    onSuccess: async () => {
      // simplest + safest: refetch tasks
      await qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { title?: string; description?: string; completed?: boolean } }) =>
      api.updateTask(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

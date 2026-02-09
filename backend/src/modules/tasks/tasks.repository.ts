import { prisma } from "../../prisma/client";

export type TaskCreateInput = {
  userId: string;
  title: string;
  description?: string;
};

const taskSelect = {
  id: true,
  userId: true,
  title: true,
  description: true,
  completed: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function createTask(data: TaskCreateInput) {
  return prisma.task.create({
    data: {
      userId: data.userId,
      title: data.title,
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
    select: taskSelect,
  });
}

export function listTasksByUser(userId: string, completed?: boolean) {
  return prisma.task.findMany({
    where: {
      userId,
      ...(completed === undefined ? {} : { completed }),
    },
    orderBy: { createdAt: "desc" },
    select: taskSelect,
  });
}

export function findTaskByIdAndUser(userId: string, taskId: string) {
  return prisma.task.findFirst({
    where: { id: taskId, userId },
    select: taskSelect,
  });
}

export type TaskUpdateInput = {
  title?: string;
  description?: string;
  completed?: boolean;
};

export async function updateTaskByIdAndUser(userId: string, taskId: string, data: TaskUpdateInput) {
  const res = await prisma.task.updateMany({
    where: { id: taskId, userId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.completed !== undefined ? { completed: data.completed } : {}),
    },
  });

  return res.count; // 0 means not found (or not owned)
}

export async function deleteTaskById(userId: string, taskId: string) {
  const res = await prisma.task.deleteMany({
    where: { id: taskId, userId },
  });
  return res.count;
}

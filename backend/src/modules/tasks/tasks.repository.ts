import { prisma } from "../../prisma/client";

export type TaskCreateInput = {
  userId: string;
  title: string;
  description?: string;
};

export function createTask(data: TaskCreateInput) {
  return prisma.task.create({
    data: {
      userId: data.userId,
      title: data.title,
      ...(data.description !== undefined ? { description: data.description } : {}),    },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      completed: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function listTasksByUser(userId: string, completed?: boolean) {
  return prisma.task.findMany({
    where: {
      userId,
      ...(completed === undefined ? {} : { completed }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      completed: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

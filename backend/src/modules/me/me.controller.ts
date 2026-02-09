import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { prisma } from "../../prisma/client";
import { HttpError } from "../../utils/httpError";

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new HttpError(401, "UNAUTHORIZED");

  const user = await prisma.user.findUnique({
    where: { id: req.auth.userId },
    select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
  });

  if (!user) throw new HttpError(401, "USER_NOT_FOUND");

  return res.json({ ok: true, user });
});

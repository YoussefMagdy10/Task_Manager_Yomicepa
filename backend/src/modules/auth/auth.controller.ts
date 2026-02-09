import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { HttpError } from "../../utils/httpError";
import { asyncHandler } from "../../utils/asyncHandler";
import { signupSchema, signinSchema } from "./auth.schemas";
import { createSession, hashPassword, rotateSession, revokeSession, signAccessToken, verifyPassword, } from "./auth.service";

function cookieOptions() {
  const secure = String(process.env.COOKIE_SECURE ?? "false") === "true";
  const sameSite = (process.env.COOKIE_SAMESITE ?? "lax") as "lax" | "strict" | "none";
  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth",
  };
}

const COOKIE_NAME = process.env.COOKIE_NAME ?? "refreshToken";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  console.log("username raw:", JSON.stringify(req.body.username));
  console.log("codes:", [...String(req.body.username ?? "")].map(c => c.charCodeAt(0)));

  const body = signupSchema.parse(req.body);

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: body.email }, { username: body.username }] },
  });
  if (existing) throw new HttpError(409, "USER_ALREADY_EXISTS");

  const passwordHash = await hashPassword(body.password);

  const user = await prisma.user.create({
    data: { email: body.email, username: body.username, passwordHash },
    select: { id: true, email: true, username: true },
  });

  const accessToken = signAccessToken({ sub: user.id, email: user.email, username: user.username });
  const session = await createSession(user.id);

  res.cookie(COOKIE_NAME, session.refreshToken, cookieOptions());

  return res.status(201).json({
    ok: true,
    user,
    accessToken,
  });
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const body = signinSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw new HttpError(401, "INVALID_CREDENTIALS - Wrong Email");

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) throw new HttpError(401, "INVALID_CREDENTIALS - Wrong Password");

  const accessToken = signAccessToken({ sub: user.id, email: user.email, username: user.username });
  const session = await createSession(user.id);

  res.cookie(COOKIE_NAME, session.refreshToken, cookieOptions());

  return res.json({
    ok: true,
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const tokenValue = req.cookies?.[COOKIE_NAME];
  if (!tokenValue) throw new HttpError(401, "MISSING_REFRESH_TOKEN");

  const rotated = await rotateSession(tokenValue);

  const user = await prisma.user.findUnique({
    where: { id: rotated.userId },
    select: { id: true, email: true, username: true },
  });
  if (!user) throw new HttpError(401, "INVALID_REFRESH_TOKEN");

  const accessToken = signAccessToken({ sub: user.id, email: user.email, username: user.username });

  // set new cookie (rotation)
  res.cookie(COOKIE_NAME, rotated.refreshToken, cookieOptions());

  return res.json({
    ok: true,
    user,
    accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const tokenValue = req.cookies?.[COOKIE_NAME];
  if (tokenValue) {
    await revokeSession(tokenValue);
  }

  res.clearCookie(COOKIE_NAME, cookieOptions());
  return res.json({ ok: true });
});

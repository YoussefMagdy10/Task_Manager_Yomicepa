import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../prisma/client";
import { HttpError } from "../../utils/httpError";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type ms from "ms";

const ACCESS_SECRET: Secret = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL: ms.StringValue = (process.env.ACCESS_TOKEN_TTL ?? "15m") as ms.StringValue;
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? "7");

// short-lived JWT
export function signAccessToken(payload: { sub: string; email: string; username: string }) {
  if (!ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is missing");

  const options: SignOptions = { expiresIn: ACCESS_TTL };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

/* long-lived JWT: Harder to rotate & revoke sessions
 Not used: Instead, refresh token uses random string stored to DB.
 Basics: cookie holds only a random token, DB controls validity.
*/
// function signRefreshJwt(payload: { sub: string }) {
//   const expiresInSeconds = REFRESH_TTL_DAYS * 24 * 60 * 60;
//   return jwt.sign(payload, REFRESH_SECRET, { expiresIn: expiresInSeconds });
// }

export function verifyRefreshJwt(token: string): { sub: string } {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { sub: string };
  } catch {
    throw new HttpError(401, "INVALID_REFRESH_TOKEN");
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12); // 12 round of hashing: first step of "High" Security (following Bcrypt Generator @ https://bcrypt-generator.com/)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createRefreshTokenValue() {
  return crypto.randomBytes(48).toString("base64url");
}

export async function hashRefreshToken(tokenValue: string) {
  return crypto.createHash("sha256").update(tokenValue).digest("hex"); // SHA-256 is ok since token is already high-entropy random.
}

export function refreshTokenExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + REFRESH_TTL_DAYS);
  return d;
}

export async function createSession(userId: string) {
  const tokenValue = createRefreshTokenValue();
  const tokenHash = await hashRefreshToken(tokenValue);
  const expiresAt = refreshTokenExpiryDate();

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { refreshToken: tokenValue, expiresAt };
}

export async function rotateSession(oldTokenValue: string, userIdFromJwt?: string) {
  const oldHash = await hashRefreshToken(oldTokenValue);

  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: oldHash } });
  if (!existing) throw new HttpError(401, "INVALID_REFRESH_TOKEN");
  if (existing.revokedAt) throw new HttpError(401, "REFRESH_TOKEN_REVOKED");
  if (existing.expiresAt < new Date()) throw new HttpError(401, "REFRESH_TOKEN_EXPIRED");

  // Optional: bind to userId if provided
  if (userIdFromJwt && existing.userId !== userIdFromJwt) {
    throw new HttpError(401, "INVALID_REFRESH_TOKEN");
  }

  // Revoke old + issue new
  const newTokenValue = createRefreshTokenValue();
  const newHash = await hashRefreshToken(newTokenValue);
  const newExpiresAt = refreshTokenExpiryDate();

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: { userId: existing.userId, tokenHash: newHash, expiresAt: newExpiresAt },
    }),
  ]);

  return { userId: existing.userId, refreshToken: newTokenValue, expiresAt: newExpiresAt };
}

export async function revokeSession(tokenValue: string) {
  const tokenHash = await hashRefreshToken(tokenValue);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!existing) return; // idempotent logout
  if (existing.revokedAt) return;

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });
}

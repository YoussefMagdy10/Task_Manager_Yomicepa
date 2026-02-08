import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
};

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  return token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) {
    return next(new HttpError(401, "MISSING_ACCESS_TOKEN", "Missing Bearer token"));
  }

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

    if (!decoded?.sub || !decoded.email || !decoded.username) {
      return next(new HttpError(401, "INVALID_ACCESS_TOKEN", "Invalid token payload"));
    }

    req.auth = {
      userId: decoded.sub,
      email: decoded.email,
      username: decoded.username,
    };

    return next();
  } catch (err: any) {
    // jsonwebtoken errors: TokenExpiredError, JsonWebTokenError, NotBeforeError
    if (err?.name === "TokenExpiredError") {
      return next(new HttpError(401, "ACCESS_TOKEN_EXPIRED", "Access token expired"));
    }
    return next(new HttpError(401, "INVALID_ACCESS_TOKEN", "Invalid access token"));
  }
}

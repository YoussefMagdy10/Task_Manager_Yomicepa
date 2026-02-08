import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

export function errorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (res.headersSent) return next(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      ok: false,
      error: { code: err.code, message: err.message },
    });
  }

  return res.status(500).json({
    ok: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" },
  });
}

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError";

export function errorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) return next(err);

  // Expected client errors: don't spam console
  if (err instanceof HttpError) {
    if (err.status >= 500) console.error(err);
    return res.status(err.status).json({
      ok: false,
      error: { code: err.code, message: err.message },
    });
  }

  if (err instanceof ZodError) {
    // also expected; usually no need to console.error
    return res.status(400).json({
      ok: false,
      error: { code: "VALIDATION_ERROR", details: err.flatten() },
    });
  }

  // Unexpected errors: log them
  console.error(err);

  return res.status(500).json({
    ok: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Unexpected server error" },
  });
}

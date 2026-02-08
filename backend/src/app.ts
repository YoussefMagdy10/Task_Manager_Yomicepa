import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/swagger";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);

  // Swagger
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  // Error handler last
  app.use(errorHandler);

  return app;
}

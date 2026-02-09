import express from "express";
import cookieParser from "cookie-parser";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./docs/swagger";
import { meRouter } from "./modules/me/me.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import cors from "cors";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api", meRouter);
  app.use("/api", tasksRouter);

  // Swagger
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  // Error handler last
  app.use(errorHandler);


  return app;
}

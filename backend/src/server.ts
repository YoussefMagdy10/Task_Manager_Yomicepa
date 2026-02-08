// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();

// // Basic middleware
// app.use(helmet());
// app.use(morgan("dev"));
// app.use(express.json());
// app.use(cookieParser());

// // CORS (adjust later when frontend domain exists)
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );

// // Health check
// app.get("/health", (_req, res) => {
//   res.json({ ok: true, message: "API is healthy" });
// });

// const port = Number(process.env.PORT ?? 4000);
// app.listen(port, () => {
//   console.log(`API listening on http://localhost:${port}`);
// });


import "dotenv/config";
import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 4000);

createApp().listen(PORT, () => {
  console.log("DATABASE_URL =", process.env.DATABASE_URL);
  console.log("JWT_ACCESS_SECRET exists?", !!process.env.JWT_ACCESS_SECRET);
  console.log(`API listening on http://localhost:${PORT}`);
});

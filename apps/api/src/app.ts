import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { registerRoutes } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "512kb" }));

  app.get("/", (_req, res) => {
    res.json({
      message: "ApplyNest API is running",
      status: "ok",
    });
  });

  registerRoutes(app);

  app.use(errorMiddleware);
  return app;
}

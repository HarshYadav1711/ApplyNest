import type { Express } from "express";
import aiRoutes from "./aiRoutes.js";
import applicationRoutes from "./applicationRoutes.js";
import authRoutes from "./authRoutes.js";
import healthRoutes from "./healthRoutes.js";

export function registerRoutes(app: Express): void {
  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/ai", aiRoutes);
}

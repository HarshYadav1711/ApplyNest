import type { Express } from "express";
import authRoutes from "./authRoutes.js";
import healthRoutes from "./healthRoutes.js";

export function registerRoutes(app: Express): void {
  app.use("/api", healthRoutes);
  app.use("/api/auth", authRoutes);
}

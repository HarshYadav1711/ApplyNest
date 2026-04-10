import type { Express } from "express";
import healthRoutes from "./healthRoutes.js";

export function registerRoutes(app: Express): void {
  app.use("/api", healthRoutes);
}

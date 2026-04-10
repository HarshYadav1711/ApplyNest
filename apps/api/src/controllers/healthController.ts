import type { Request, Response } from "express";

/** Placeholder — replace with real controllers as features are added. */
export function getHealth(_req: Request, res: Response): void {
  res.json({ status: "ok", service: "applynest-api" });
}

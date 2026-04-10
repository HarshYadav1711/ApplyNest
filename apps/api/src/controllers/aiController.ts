import type { Request, Response } from "express";
import { parseJobDescription } from "../services/ai/parseJobDescription.js";
import type { ParseJobDescriptionBody } from "../validators/aiValidators.js";

export async function parseJob(req: Request, res: Response): Promise<void> {
  const body = req.body as ParseJobDescriptionBody;
  const parsed = await parseJobDescription(body.text);
  res.json({ parsed });
}

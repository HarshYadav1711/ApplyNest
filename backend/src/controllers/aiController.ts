import type { Request, Response } from "express";
import { parseJobDescription } from "../services/ai/parseJobDescription.js";
import { suggestResumeBullets } from "../services/ai/suggestResumeBullets.js";
import type {
  ParseJobDescriptionBody,
  SuggestResumeBulletsBody,
} from "../validators/aiValidators.js";

export async function parseJob(req: Request, res: Response): Promise<void> {
  const body = req.body as ParseJobDescriptionBody;
  const parsed = await parseJobDescription(body.text);
  res.json({ parsed });
}

export async function suggestBullets(req: Request, res: Response): Promise<void> {
  const body = req.body as SuggestResumeBulletsBody;
  const result = await suggestResumeBullets({
    companyName: body.companyName,
    positionTitle: body.positionTitle,
    parsedSummary: body.parsedSummary,
    requiredSkills: body.requiredSkills,
    notes: body.notes,
  });
  res.json(result);
}

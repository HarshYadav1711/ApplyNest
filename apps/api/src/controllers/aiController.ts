import type { Request, Response } from "express";
import { generateResumeBullets } from "../services/ai/generateResumeBullets.js";
import { parseJobDescription } from "../services/ai/parseJobDescription.js";
import type {
  ParseJobDescriptionBody,
  ResumeBulletsBody,
} from "../validators/aiValidators.js";

export async function parseJob(req: Request, res: Response): Promise<void> {
  const body = req.body as ParseJobDescriptionBody;
  const parsed = await parseJobDescription(body.text);
  res.json({ parsed });
}

export async function resumeBullets(req: Request, res: Response): Promise<void> {
  const body = req.body as ResumeBulletsBody;
  const result = await generateResumeBullets({
    jobDescriptionText: body.jobDescriptionText,
    role: body.role,
    company: body.company,
    requiredSkills: body.requiredSkills,
    niceToHaveSkills: body.niceToHaveSkills,
  });
  res.json(result);
}

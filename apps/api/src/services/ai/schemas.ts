import { z } from "zod";

/** Strict shape returned to clients after validation (AI or fallback). */
export const parsedJobSchema = z.object({
  company: z.string().max(200).default(""),
  role: z.string().max(200).default(""),
  requiredSkills: z.array(z.string().max(150)).max(40).default([]),
  niceToHaveSkills: z.array(z.string().max(150)).max(40).default([]),
  seniority: z.string().max(120).default(""),
  location: z.string().max(300).default(""),
});

export type ParsedJob = z.infer<typeof parsedJobSchema>;

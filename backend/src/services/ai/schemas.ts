import { z } from "zod";

/** Validated shape for parsed job description — used after every AI or fallback path */
export const parsedJobSchema = z.object({
  companyName: z.string().max(200).default(""),
  positionTitle: z.string().max(200).default(""),
  location: z.string().max(500).default(""),
  requiredSkills: z.array(z.string().max(200)).max(50).default([]),
  responsibilities: z.array(z.string().max(500)).max(30).default([]),
  summary: z.string().max(5000).default(""),
});

export type ParsedJob = z.infer<typeof parsedJobSchema>;

export const resumeBulletsSchema = z.object({
  bullets: z.array(z.string().max(800)).min(1).max(12),
});

export type ResumeBullets = z.infer<typeof resumeBulletsSchema>;

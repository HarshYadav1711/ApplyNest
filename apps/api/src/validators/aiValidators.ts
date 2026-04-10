import { z } from "zod";

export const parseJobDescriptionBodySchema = z.object({
  text: z.string().min(20).max(50000),
});

export type ParseJobDescriptionBody = z.infer<
  typeof parseJobDescriptionBodySchema
>;

export const resumeBulletsBodySchema = z.object({
  jobDescriptionText: z.string().min(20).max(50000),
  role: z.string().min(1).max(200),
  company: z.string().max(200).optional().default(""),
  requiredSkills: z.array(z.string().max(150)).max(40).default([]),
  niceToHaveSkills: z.array(z.string().max(150)).max(40).default([]),
});

export type ResumeBulletsBody = z.infer<typeof resumeBulletsBodySchema>;

import { z } from "zod";

export const parseJobDescriptionBodySchema = z.object({
  text: z.string().min(20).max(50000),
});

export const suggestResumeBulletsBodySchema = z.object({
  companyName: z.string().min(1).max(200),
  positionTitle: z.string().min(1).max(200),
  parsedSummary: z.string().max(20000).optional().default(""),
  requiredSkills: z.array(z.string().max(200)).max(100).optional().default([]),
  /** Optional user-provided context */
  notes: z.string().max(10000).optional().default(""),
});

export type ParseJobDescriptionBody = z.infer<
  typeof parseJobDescriptionBodySchema
>;
export type SuggestResumeBulletsBody = z.infer<
  typeof suggestResumeBulletsBodySchema
>;

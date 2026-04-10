import { z } from "zod";

export const parseJobDescriptionBodySchema = z.object({
  text: z.string().min(20).max(50000),
});

export type ParseJobDescriptionBody = z.infer<
  typeof parseJobDescriptionBodySchema
>;

import { z } from "zod";
import { APPLICATION_STATUSES } from "../constants/statuses.js";

const statusTuple = APPLICATION_STATUSES as unknown as [string, ...string[]];
const statusEnum = z.enum(statusTuple);

const jobUrlField = z
  .string()
  .max(2000)
  .optional()
  .default("")
  .refine((s) => s === "" || /^https?:\/\/.+/i.test(s), {
    message: "Must be a valid http(s) URL or empty",
  });

export const createApplicationBodySchema = z.object({
  companyName: z.string().min(1).max(200).trim(),
  positionTitle: z.string().min(1).max(200).trim(),
  status: statusEnum.optional(),
  notes: z.string().max(10000).optional().default(""),
  jobUrl: jobUrlField,
  location: z.string().max(500).optional().default(""),
  parsedSummary: z.string().max(20000).optional().default(""),
  requiredSkills: z.array(z.string().max(200)).max(100).optional().default([]),
});

export const updateApplicationBodySchema = z
  .object({
    companyName: z.string().min(1).max(200).trim().optional(),
    positionTitle: z.string().min(1).max(200).trim().optional(),
    status: statusEnum.optional(),
    notes: z.string().max(10000).optional(),
    jobUrl: z
      .string()
      .max(2000)
      .optional()
      .refine(
        (s) => s === undefined || s === "" || /^https?:\/\/.+/i.test(s),
        { message: "Must be a valid http(s) URL or empty" }
      ),
    location: z.string().max(500).optional(),
    parsedSummary: z.string().max(20000).optional(),
    requiredSkills: z.array(z.string().max(200)).max(100).optional(),
  })
  .strict();

export const applicationIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;
export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;

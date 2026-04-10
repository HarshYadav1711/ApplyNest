import { z } from "zod";
import { APPLICATION_STATUSES } from "../constants/applicationStatus.js";

const statusEnum = z.enum(
  APPLICATION_STATUSES as unknown as [string, ...string[]]
);

const jdLinkField = z
  .string()
  .max(2000)
  .optional()
  .default("")
  .refine((s) => s === "" || /^https?:\/\/.+/i.test(s), {
    message: "JD link must be a valid http(s) URL or empty",
  });

const salaryRangeField = z.string().max(200).optional().default("");

export const createApplicationBodySchema = z.object({
  company: z.string().min(1).max(200).trim(),
  role: z.string().min(1).max(200).trim(),
  jdLink: jdLinkField,
  notes: z.string().max(10000).optional().default(""),
  dateApplied: z.coerce.date(),
  status: statusEnum.optional(),
  salaryRange: salaryRangeField,
});

export const updateApplicationBodySchema = z
  .object({
    company: z.string().min(1).max(200).trim().optional(),
    role: z.string().min(1).max(200).trim().optional(),
    jdLink: z
      .string()
      .max(2000)
      .optional()
      .refine(
        (s) => s === undefined || s === "" || /^https?:\/\/.+/i.test(s),
        { message: "JD link must be a valid http(s) URL or empty" }
      ),
    notes: z.string().max(10000).optional(),
    dateApplied: z.coerce.date().optional(),
    status: statusEnum.optional(),
    salaryRange: z.string().max(200).optional(),
  })
  .strict();

export const applicationIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i),
});

export type CreateApplicationBody = z.infer<typeof createApplicationBodySchema>;
export type UpdateApplicationBody = z.infer<typeof updateApplicationBodySchema>;

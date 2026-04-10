import { env } from "../../config/env.js";
import { fallbackParseJobDescription } from "./fallbackParseJobDescription.js";
import { getOpenAIClient } from "./openaiClient.js";
import { parsedJobSchema, type ParsedJob } from "./schemas.js";

const SYSTEM = `You extract structured recruiting data from a job description.
Respond with ONLY valid JSON (no markdown) using exactly these keys:
{
  "company": string (employer name if stated, else empty string),
  "role": string (job title / role name),
  "requiredSkills": string[] (must-have tools/skills, short phrases, max 40 items),
  "niceToHaveSkills": string[] (bonus skills, max 40 items),
  "seniority": string (e.g. Junior, Mid-level, Senior, Staff — or empty if unclear),
  "location": string (work location, remote/hybrid, or empty)
}
Use empty strings and empty arrays when unknown. Do not invent a company name if not stated.`;

function sanitize(data: ParsedJob): ParsedJob {
  return parsedJobSchema.parse({
    ...data,
    company: data.company.trim().slice(0, 200),
    role: data.role.trim().slice(0, 200),
    requiredSkills: data.requiredSkills
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40),
    niceToHaveSkills: data.niceToHaveSkills
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40),
    seniority: data.seniority.trim().slice(0, 120),
    location: data.location.trim().slice(0, 300),
  });
}

/**
 * Provider entry: OpenAI JSON mode when configured; otherwise deterministic fallback.
 * Invalid model output never escapes — we validate with Zod and fall back.
 */
export async function parseJobDescription(text: string): Promise<ParsedJob> {
  const client = getOpenAIClient();
  if (!client) {
    return fallbackParseJobDescription(text);
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.openaiModel,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Job description:\n\n${text.slice(0, 48000)}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4096,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackParseJobDescription(text);
    }
    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      return fallbackParseJobDescription(text);
    }
    const parsed = parsedJobSchema.safeParse(json);
    if (!parsed.success) {
      return fallbackParseJobDescription(text);
    }
    return sanitize(parsed.data);
  } catch (err) {
    console.warn("parseJobDescription: OpenAI error, using fallback:", err);
    return fallbackParseJobDescription(text);
  }
}

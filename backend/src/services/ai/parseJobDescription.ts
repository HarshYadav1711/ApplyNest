import { env } from "../../config/env.js";
import { fallbackParseJobDescription } from "./fallbackParseJobDescription.js";
import { getOpenAIClient } from "./openaiClient.js";
import { parsedJobSchema, type ParsedJob } from "./schemas.js";

const SYSTEM = `You extract structured recruiting data from a job description. Respond with ONLY valid JSON matching this shape (no markdown):
{
  "companyName": string (empty if unknown),
  "positionTitle": string (empty if unknown),
  "location": string (empty if unknown),
  "requiredSkills": string[] (concise skills/tools, max 50 items),
  "responsibilities": string[] (short bullets, max 30 items),
  "summary": string (2-6 sentences, max 5000 chars)
}
Never invent a company name if not stated.`;

function sanitizeParsed(data: ParsedJob): ParsedJob {
  return parsedJobSchema.parse({
    ...data,
    companyName: data.companyName.trim().slice(0, 200),
    positionTitle: data.positionTitle.trim().slice(0, 200),
    location: data.location.trim().slice(0, 500),
    requiredSkills: data.requiredSkills
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50),
    responsibilities: data.responsibilities
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30),
    summary: data.summary.trim().slice(0, 5000),
  });
}

/**
 * Provider-agnostic entry: OpenAI when configured, else deterministic fallback.
 * All outputs validated; never throws to callers for malformed model output.
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
    return sanitizeParsed(parsed.data);
  } catch (err) {
    console.warn("parseJobDescription: OpenAI failed, using fallback:", err);
    return fallbackParseJobDescription(text);
  }
}

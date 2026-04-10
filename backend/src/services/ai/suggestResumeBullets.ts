import { env } from "../../config/env.js";
import { fallbackSuggestResumeBullets } from "./fallbackSuggestResumeBullets.js";
import { getOpenAIClient } from "./openaiClient.js";
import { resumeBulletsSchema, type ResumeBullets } from "./schemas.js";

const SYSTEM = `You write concise, credible resume bullet points for a candidate targeting a specific job.
Respond with ONLY valid JSON: { "bullets": string[] } with 4-8 bullets.
Each bullet: one line, starts with a strong verb, quantifies impact when plausible, no first person, max ~220 characters each.
Bullets must plausibly align with the job title and skills; do not fabricate specific metrics without basis — use qualitative strength when needed.`;

function sanitizeBullets(data: ResumeBullets): ResumeBullets {
  const bullets = data.bullets
    .map((b) => b.trim())
    .filter(Boolean)
    .slice(0, 12);
  return resumeBulletsSchema.parse({ bullets });
}

export async function suggestResumeBullets(input: {
  companyName: string;
  positionTitle: string;
  parsedSummary: string;
  requiredSkills: string[];
  notes: string;
}): Promise<ResumeBullets> {
  const client = getOpenAIClient();
  if (!client) {
    return fallbackSuggestResumeBullets(input);
  }

  const userPayload = [
    `Company: ${input.companyName}`,
    `Role: ${input.positionTitle}`,
    `Key skills from JD: ${input.requiredSkills.join(", ") || "n/a"}`,
    `JD summary: ${input.parsedSummary.slice(0, 8000)}`,
    input.notes.trim()
      ? `Candidate notes to reflect (truthfully): ${input.notes.slice(0, 4000)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const completion = await client.chat.completions.create({
      model: env.openaiModel,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPayload },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2048,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackSuggestResumeBullets(input);
    }
    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      return fallbackSuggestResumeBullets(input);
    }
    const parsed = resumeBulletsSchema.safeParse(json);
    if (!parsed.success) {
      return fallbackSuggestResumeBullets(input);
    }
    return sanitizeBullets(parsed.data);
  } catch (err) {
    console.warn("suggestResumeBullets: OpenAI failed, using fallback:", err);
    return fallbackSuggestResumeBullets(input);
  }
}

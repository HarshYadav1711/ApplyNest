import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import { fallbackGenerateResumeBullets } from "./fallbackGenerateResumeBullets.js";
import { getOpenAIClient } from "./openaiClient.js";
import {
  resumeBulletsResponseSchema,
  type ResumeBulletsPayload,
} from "./schemas.js";
import type {
  ResumeBulletsInput,
  ResumeBulletsResult,
} from "./resumeBulletsTypes.js";

const SYSTEM = `You write resume achievement bullets for a candidate targeting ONE specific job.

Rules:
- Output ONLY valid JSON (no markdown, no prose outside JSON) with exactly one key "bullets" whose value is an array of 3 to 5 strings.
- Each string is ONE resume bullet: past tense, active voice, starts with a strong verb, no first person, no quotation marks inside the bullet.
- Every bullet MUST tie to this job: reference concrete tools, domains, or responsibilities that appear in the job description text OR in the provided required/nice-to-have skill lists. At least one such concrete term must appear in each bullet.
- Do NOT write generic filler (avoid standalone phrases like "strong communication skills", "team player", "detail-oriented", "fast-paced environment", "results-driven" without tying them to a specific duty or tool from the posting).
- Do NOT repeat the same accomplishment five times; vary the angle (delivery, quality, collaboration, scale, reliability, etc.) while staying faithful to the posting.
- Bullets should sound plausible for a real resume: include implied scope (e.g. services, users, latency) only when reasonable from the JD; do not invent employer metrics or company names not in the input.
- Keep each bullet under 450 characters.`;

function normalizeInput(input: ResumeBulletsInput): ResumeBulletsInput {
  return {
    jobDescriptionText: input.jobDescriptionText.trim(),
    role: input.role.trim(),
    company: input.company.trim(),
    requiredSkills: input.requiredSkills
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40),
    niceToHaveSkills: input.niceToHaveSkills
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40),
  };
}

const BULLET_MIN_LEN = 28;
const BULLET_MAX_LEN = 600;

function stripBulletPrefix(line: string): string {
  return line.replace(/^[\s•\-\*‣▪]+/u, "").trim();
}

function sanitizeBullets(raw: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of raw) {
    const s = stripBulletPrefix(line);
    if (s.length < BULLET_MIN_LEN || s.length > BULLET_MAX_LEN) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= 5) break;
  }
  return out;
}

function validatePayload(data: ResumeBulletsPayload): string[] {
  const bullets = sanitizeBullets(data.bullets);
  if (bullets.length < 3) {
    throw new AppError(
      502,
      "AI returned resume suggestions that could not be validated. Try again."
    );
  }
  return bullets;
}

export async function generateResumeBullets(
  input: ResumeBulletsInput
): Promise<ResumeBulletsResult> {
  const ctx = normalizeInput(input);

  const client = getOpenAIClient();
  if (!client) {
    const bullets = sanitizeBullets(fallbackGenerateResumeBullets(ctx));
    return { bullets, source: "fallback" };
  }

  const skillsBlock = [
    ctx.requiredSkills.length
      ? `Required skills (use verbatim where natural): ${ctx.requiredSkills.join("; ")}`
      : "",
    ctx.niceToHaveSkills.length
      ? `Nice-to-have skills: ${ctx.niceToHaveSkills.join("; ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const userContent = `Target role title: ${ctx.role}
${ctx.company ? `Company name (optional context only; do not invent facts about the company): ${ctx.company}` : ""}

${skillsBlock}

Job description (primary source of truth for responsibilities and vocabulary):
"""
${ctx.jobDescriptionText.slice(0, 48000)}
"""

Produce the JSON object with the "bullets" array now.`;

  try {
    const completion = await client.chat.completions.create({
      model: env.openaiModel,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      temperature: 0.35,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new AppError(
        502,
        "No resume suggestions returned from the model. Try again."
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(raw) as unknown;
    } catch {
      throw new AppError(
        502,
        "Resume suggestions were not valid JSON. Try again."
      );
    }

    const parsed = resumeBulletsResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError(
        502,
        "Resume suggestions failed validation. Try again or shorten the job description."
      );
    }

    const bullets = validatePayload(parsed.data);
    return { bullets, source: "openai" };
  } catch (err) {
    if (err instanceof AppError) throw err;
    console.warn("generateResumeBullets: OpenAI error:", err);
    throw new AppError(
      502,
      "Could not generate resume bullet suggestions. Try again shortly."
    );
  }
}

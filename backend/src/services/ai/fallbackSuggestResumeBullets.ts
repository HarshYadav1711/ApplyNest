import { resumeBulletsSchema, type ResumeBullets } from "./schemas.js";

function uniqueSkills(skills: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of skills) {
    const t = s.trim();
    if (t.length < 2) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Template bullets when no API key — still tailored to title + skills keywords.
 */
export function fallbackSuggestResumeBullets(input: {
  companyName: string;
  positionTitle: string;
  parsedSummary: string;
  requiredSkills: string[];
  notes: string;
}): ResumeBullets {
  const skills = uniqueSkills(
    [...input.requiredSkills, ...input.parsedSummary.split(/[\s,;]+/)].filter(
      (w) => w.length > 2 && w.length < 40
    ),
    8
  );
  const skillPhrase =
    skills.slice(0, 4).join(", ") || "relevant stack and tooling";
  const role = input.positionTitle.trim() || "this role";
  const company = input.companyName.trim() || "the team";

  const bullets = [
    `Shipped features aligned with ${role} expectations, applying ${skillPhrase} in production environments.`,
    `Partnered with product and peers at ${company} to clarify requirements, estimate work, and deliver iteratively.`,
    `Improved reliability and clarity through testing, code review, and documentation tied to ${role} outcomes.`,
    `Translated ambiguous specs into concrete technical plans, reducing rework and accelerating delivery.`,
  ];

  if (input.notes.trim().length > 10) {
    bullets.push(
      `Highlighted experience from prior work: ${input.notes.trim().slice(0, 200)}${input.notes.length > 200 ? "…" : ""}`
    );
  }

  const parsed = resumeBulletsSchema.safeParse({ bullets: bullets.slice(0, 8) });
  if (parsed.success) return parsed.data;

  return resumeBulletsSchema.parse({
    bullets: [
      "Delivered measurable impact in cross-functional teams using clear communication and ownership.",
    ],
  });
}

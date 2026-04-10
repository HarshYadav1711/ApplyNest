import { parsedJobSchema, type ParsedJob } from "./schemas.js";

function takeBulletLines(lines: string[]): string[] {
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (
      t.startsWith("-") ||
      t.startsWith("•") ||
      /^\d+[\.)]\s/.test(t)
    ) {
      const cleaned = t.replace(/^[-•\d.)]+\s*/, "").slice(0, 500);
      if (cleaned.length > 3) out.push(cleaned);
    }
    if (out.length >= 20) break;
  }
  return out;
}

function guessTitle(firstLines: string[]): string {
  for (const line of firstLines.slice(0, 8)) {
    const t = line.trim();
    if (t.length > 5 && t.length < 120 && /engineer|developer|manager|analyst|designer|scientist|lead|architect/i.test(t)) {
      return t;
    }
  }
  const first = firstLines[0]?.trim();
  return first && first.length < 150 ? first : "Role (see summary)";
}

function extractSkills(text: string): string[] {
  const skills = new Set<string>();
  const common =
    /\b(TypeScript|JavaScript|Python|Java|Go|Rust|C\+\+|React|Node\.?js|AWS|Azure|GCP|Kubernetes|Docker|SQL|MongoDB|PostgreSQL|GraphQL|REST|CI\/CD|Terraform|Linux|Agile)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = common.exec(text)) !== null) {
    skills.add(m[1]);
    if (skills.size >= 25) break;
  }
  return [...skills].slice(0, 50);
}

/**
 * Deterministic parser when no API key or model failure.
 * Never throws — output is always schema-safe.
 */
export function fallbackParseJobDescription(raw: string): ParsedJob {
  const text = raw.slice(0, 50000);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const positionTitle = guessTitle(lines);
  const responsibilities = takeBulletLines(lines);
  const requiredSkills = extractSkills(text);
  const summary =
    lines.slice(0, 12).join(" ").slice(0, 2000) ||
    text.slice(0, 2000);

  const candidate: ParsedJob = {
    companyName: "",
    positionTitle,
    location: "",
    requiredSkills,
    responsibilities: responsibilities.length ? responsibilities : [text.slice(0, 400)],
    summary,
  };

  const parsed = parsedJobSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  return parsedJobSchema.parse({
    companyName: "",
    positionTitle: "Parsed role",
    location: "",
    requiredSkills: [],
    responsibilities: [text.slice(0, 400)],
    summary: text.slice(0, 2000),
  });
}

import { parsedJobSchema, type ParsedJob } from "./schemas.js";

function extractTechSkills(text: string): string[] {
  const skills = new Set<string>();
  const pattern =
    /\b(TypeScript|JavaScript|Python|Java|Go|Rust|C\+\+|Ruby|PHP|Swift|Kotlin|React|Node\.?js|Vue|Angular|AWS|Azure|GCP|Kubernetes|Docker|SQL|PostgreSQL|MongoDB|Redis|GraphQL|REST|gRPC|Terraform|Linux|Kafka|Elasticsearch)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    skills.add(m[1]);
    if (skills.size >= 25) break;
  }
  return [...skills].slice(0, 40);
}

function guessSeniority(text: string): string {
  const t = text.toLowerCase();
  if (/\b(principal|distinguished|fellow)\b/.test(t)) return "Principal / distinguished";
  if (/\b(staff)\b/.test(t)) return "Staff";
  if (/\b(senior|sr\.?)\b/.test(t)) return "Senior";
  if (/\b(mid|intermediate)\b/.test(t)) return "Mid-level";
  if (/\b(junior|jr\.?|entry|graduate|associate)\b/.test(t)) return "Junior / entry";
  if (/\b(intern)\b/.test(t)) return "Intern";
  return "";
}

function guessTitle(lines: string[]): string {
  for (const line of lines.slice(0, 12)) {
    const t = line.trim();
    if (
      t.length > 4 &&
      t.length < 120 &&
      /(engineer|developer|scientist|designer|architect|manager|lead|analyst)/i.test(t)
    ) {
      return t;
    }
  }
  const first = lines[0]?.trim();
  return first && first.length < 120 ? first : "Role (see JD)";
}

function guessLocation(text: string): string {
  const remote = text.match(/\b(remote|hybrid|on-?site)\b[^.\n]*/i);
  if (remote) return remote[0].trim().slice(0, 300);
  const city = text.match(
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*(?:[A-Z]{2}|[A-Z][a-z]+)\b/
  );
  if (city) return city[0].slice(0, 300);
  return "";
}

/**
 * Deterministic parser when `OPENAI_API_KEY` is absent or the model fails.
 * Output is always schema-safe.
 */
export function fallbackParseJobDescription(raw: string): ParsedJob {
  const text = raw.slice(0, 50000);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const role = guessTitle(lines);
  const requiredSkills = extractTechSkills(text);
  const seniority = guessSeniority(text);
  const location = guessLocation(text);

  const candidate: ParsedJob = {
    company: "",
    role,
    requiredSkills: requiredSkills.length ? requiredSkills : ["See job description"],
    niceToHaveSkills: [],
    seniority: seniority || "Unspecified",
    location,
  };

  const parsed = parsedJobSchema.safeParse(candidate);
  if (parsed.success) return sanitize(parsed.data);

  return parsedJobSchema.parse({
    company: "",
    role: "Role",
    requiredSkills: [],
    niceToHaveSkills: [],
    seniority: "",
    location: "",
  });
}

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

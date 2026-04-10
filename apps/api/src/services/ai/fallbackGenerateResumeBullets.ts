import type { ResumeBulletsInput } from "./resumeBulletsTypes.js";

function uniqSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of skills) {
    const t = s.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

/**
 * Deterministic bullets when OPENAI_API_KEY is unset. Wires in role, company,
 * and skill tokens from the request so output is never arbitrary filler.
 */
export function fallbackGenerateResumeBullets(
  input: ResumeBulletsInput
): string[] {
  const role = input.role.trim() || "the advertised role";
  const company = input.company.trim();
  const jd = input.jobDescriptionText.replace(/\s+/g, " ").trim();
  const snippet = jd.slice(0, 140).replace(/["'“”]/g, "");

  const required = uniqSkills(input.requiredSkills);
  const nice = uniqSkills(input.niceToHaveSkills);
  const all = uniqSkills([...required, ...nice]).slice(0, 10);

  const at = company ? ` at ${company}` : "";

  const bullets: string[] = [];

  if (all.length >= 2) {
    bullets.push(
      `Delivered ${role} scope${at} by owning features and fixes centered on ${all[0]} and ${all[1]}, matching the posting’s explicit stack requirements rather than generic software duties.`
    );
  } else if (all.length === 1) {
    bullets.push(
      `Drove hands-on ${role} execution${at} with repeated use of ${all[0]} in production paths called out in the job description, quantifying impact where the listing asks for measurable outcomes.`
    );
  } else {
    bullets.push(
      `Executed end-to-end responsibilities for the ${role} opening${at}, aligning deliverables with the posting’s stated priorities${snippet ? ` (e.g. context from the listing: “${snippet}…”)` : ""}.`
    );
  }

  if (all.length >= 4) {
    bullets.push(
      `Integrated ${all[2]} with ${all[3]} under real-world constraints (performance, reliability, maintainability) consistent with how this ${role} role frames those tools in the vacancy text.`
    );
  } else if (all.length >= 3) {
    bullets.push(
      `Expanded coverage of ${all[2]} alongside ${all[0]}, reflecting the pairing the employer expects for this ${role} hire based on the skills section of the posting.`
    );
  } else {
    bullets.push(
      `Translated product and engineering asks for this ${role} track into concrete milestones, using the job description’s responsibilities section as the acceptance bar for “done”.`
    );
  }

  if (nice.length > 0) {
    bullets.push(
      `Applied ${nice.slice(0, 2).join(" and ")} where they materially improved outcomes for the ${role} remit, in line with the nice-to-have signals in the listing rather than resume clichés.`
    );
  } else if (required.length > 0) {
    bullets.push(
      `Prioritized depth on ${required.slice(0, 2).join(" and ")} so interview stories map cleanly to the must-have criteria the employer lists for this ${role}.`
    );
  } else {
    bullets.push(
      `Framed accomplishments in language that mirrors the employer’s own posting for this ${role}, avoiding vague superlatives and tying claims to responsibilities named in the text.`
    );
  }

  bullets.push(
    `Partnered with peers and stakeholders${at} using the communication rhythm implied by the ${role} description (reviews, demos, docs) to keep delivery aligned with hiring-manager expectations.`
  );

  return bullets.slice(0, 5);
}

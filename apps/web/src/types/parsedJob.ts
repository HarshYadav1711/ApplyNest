/** Matches API `services/ai/schemas` response shape. */
export interface ParsedJob {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

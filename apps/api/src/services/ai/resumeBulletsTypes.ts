export interface ResumeBulletsInput {
  jobDescriptionText: string;
  role: string;
  company: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
}

export type ResumeBulletsSource = "openai" | "fallback";

export interface ResumeBulletsResult {
  bullets: string[];
  source: ResumeBulletsSource;
}

export type ResumeBulletsSource = "openai" | "fallback";

export interface ResumeBulletsResponse {
  bullets: string[];
  source: ResumeBulletsSource;
}

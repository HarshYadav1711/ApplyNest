import { http } from "./http";
import type { ParsedJob } from "../types/parsedJob";
import type { ResumeBulletsResponse } from "../types/resumeBullets";

export async function parseJobDescription(text: string): Promise<ParsedJob> {
  const { data } = await http.post<{ parsed: ParsedJob }>(
    "/api/ai/parse-job",
    { text }
  );
  return data.parsed;
}

export interface ResumeBulletsRequestBody {
  jobDescriptionText: string;
  role: string;
  company: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
}

export async function fetchResumeBullets(
  body: ResumeBulletsRequestBody
): Promise<ResumeBulletsResponse> {
  const { data } = await http.post<ResumeBulletsResponse>(
    "/api/ai/resume-bullets",
    body
  );
  return data;
}

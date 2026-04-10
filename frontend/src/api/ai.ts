import { http } from "./http";
import type { ParsedJobDto, ResumeBulletsDto } from "../types/api";

export async function parseJobDescription(
  text: string
): Promise<ParsedJobDto> {
  const { data } = await http.post<{ parsed: ParsedJobDto }>(
    "/api/ai/parse-job",
    { text }
  );
  return data.parsed;
}

export async function suggestResumeBullets(input: {
  companyName: string;
  positionTitle: string;
  parsedSummary: string;
  requiredSkills: string[];
  notes: string;
}): Promise<ResumeBulletsDto> {
  const { data } = await http.post<ResumeBulletsDto>(
    "/api/ai/suggest-bullets",
    input
  );
  return data;
}

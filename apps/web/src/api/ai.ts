import { http } from "./http";
import type { ParsedJob } from "../types/parsedJob";

export async function parseJobDescription(text: string): Promise<ParsedJob> {
  const { data } = await http.post<{ parsed: ParsedJob }>(
    "/api/ai/parse-job",
    { text }
  );
  return data.parsed;
}

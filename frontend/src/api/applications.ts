import { http } from "./http";
import type { ApplicationStatus } from "../constants/statuses";
import type { ApplicationDto } from "../types/api";

export async function listApplications(): Promise<ApplicationDto[]> {
  const { data } = await http.get<{ applications: ApplicationDto[] }>(
    "/api/applications"
  );
  return data.applications;
}

export async function getApplication(id: string): Promise<ApplicationDto> {
  const { data } = await http.get<{ application: ApplicationDto }>(
    `/api/applications/${id}`
  );
  return data.application;
}

export interface CreateApplicationInput {
  companyName: string;
  positionTitle: string;
  status?: ApplicationStatus;
  notes?: string;
  jobUrl?: string;
  location?: string;
  parsedSummary?: string;
  requiredSkills?: string[];
}

export async function createApplication(
  body: CreateApplicationInput
): Promise<ApplicationDto> {
  const { data } = await http.post<{ application: ApplicationDto }>(
    "/api/applications",
    body
  );
  return data.application;
}

export async function updateApplication(
  id: string,
  body: Partial<CreateApplicationInput>
): Promise<ApplicationDto> {
  const { data } = await http.patch<{ application: ApplicationDto }>(
    `/api/applications/${id}`,
    body
  );
  return data.application;
}

export async function deleteApplication(id: string): Promise<void> {
  await http.delete(`/api/applications/${id}`);
}

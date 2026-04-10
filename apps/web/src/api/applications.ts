import { http } from "./http";
import type { ApplicationStatus } from "../constants/applicationStatus";
import type { Application } from "../types/application";

export async function listApplications(): Promise<Application[]> {
  const { data } = await http.get<{ applications: Application[] }>(
    "/api/applications"
  );
  return data.applications;
}

export async function getApplication(id: string): Promise<Application> {
  const { data } = await http.get<{ application: Application }>(
    `/api/applications/${id}`
  );
  return data.application;
}

export interface ApplicationPayload {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
}

export async function createApplication(
  body: ApplicationPayload
): Promise<Application> {
  const { data } = await http.post<{ application: Application }>(
    "/api/applications",
    body
  );
  return data.application;
}

export async function updateApplication(
  id: string,
  body: Partial<ApplicationPayload>
): Promise<Application> {
  const { data } = await http.patch<{ application: Application }>(
    `/api/applications/${id}`,
    body
  );
  return data.application;
}

export async function deleteApplication(id: string): Promise<void> {
  await http.delete(`/api/applications/${id}`);
}

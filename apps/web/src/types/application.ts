import type { ApplicationStatus } from "../constants/applicationStatus";

export interface Application {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

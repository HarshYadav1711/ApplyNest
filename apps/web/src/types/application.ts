import type { ApplicationStatus } from "../constants/applicationStatus";

export interface Application {
  id: string;
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  /** Optional reminder date (ISO). Omitted or `null` when not set. */
  followUpDate?: string | null;
  status: ApplicationStatus;
  salaryRange: string;
  location: string;
  seniority: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  createdAt: string;
  updatedAt: string;
}

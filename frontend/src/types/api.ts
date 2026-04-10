import type { ApplicationStatus } from "../constants/statuses";

export interface UserDto {
  id: string;
  email: string;
}

export interface ApplicationDto {
  id: string;
  companyName: string;
  positionTitle: string;
  status: ApplicationStatus;
  notes: string;
  jobUrl: string;
  location: string;
  parsedSummary: string;
  requiredSkills: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ParsedJobDto {
  companyName: string;
  positionTitle: string;
  location: string;
  requiredSkills: string[];
  responsibilities: string[];
  summary: string;
}

export interface ResumeBulletsDto {
  bullets: string[];
}

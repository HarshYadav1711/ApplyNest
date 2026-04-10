import { APPLICATION_STATUSES } from "../constants/applicationStatus";
import type { ApplicationStatus } from "../constants/applicationStatus";
import type { Application } from "../types/application";

export type ApplicationStats = {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
};

/** Single-pass counts for pipeline summary (O(n)). */
export function getApplicationStats(
  applications: Application[]
): ApplicationStats {
  const byStatus = {} as Record<ApplicationStatus, number>;
  for (const s of APPLICATION_STATUSES) byStatus[s] = 0;
  for (const a of applications) {
    if (byStatus[a.status] !== undefined) byStatus[a.status] += 1;
  }
  return { total: applications.length, byStatus };
}

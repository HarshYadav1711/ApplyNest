import { APPLICATION_STATUSES } from "../constants/applicationStatus";
import type { ApplicationStatus } from "../constants/applicationStatus";
import type { Application } from "../types/application";

/** Group applications by pipeline column; order within column by date applied (newest first). */
export function groupApplicationsByStatus(
  applications: Application[]
): Record<ApplicationStatus, Application[]> {
  const init = {} as Record<ApplicationStatus, Application[]>;
  for (const s of APPLICATION_STATUSES) init[s] = [];
  for (const a of applications) {
    if (init[a.status]) init[a.status].push(a);
  }
  for (const s of APPLICATION_STATUSES) {
    init[s].sort(
      (x, y) =>
        new Date(y.dateApplied).getTime() - new Date(x.dateApplied).getTime()
    );
  }
  return init;
}

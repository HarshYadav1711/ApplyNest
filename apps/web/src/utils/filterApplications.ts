import type { ApplicationStatus } from "../constants/applicationStatus";
import type { Application } from "../types/application";

export type StatusFilter = ApplicationStatus | "all";

/**
 * Client-side filter for company, role, location substring search and optional stage.
 */
export function filterApplications(
  applications: Application[],
  searchRaw: string,
  status: StatusFilter
): Application[] {
  const q = searchRaw.trim().toLowerCase();
  let out = applications;

  if (q) {
    out = out.filter((a) => {
      const loc = (a.location ?? "").toLowerCase();
      return (
        a.company.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        loc.includes(q)
      );
    });
  }

  if (status !== "all") {
    out = out.filter((a) => a.status === status);
  }

  return out;
}

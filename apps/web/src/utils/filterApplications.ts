import type { Application } from "../types/application";

/**
 * Client-side filter: company or role substring, case-insensitive.
 * Returns a new array; does not mutate `applications`.
 */
export function filterApplicationsBySearch(
  applications: Application[],
  searchRaw: string
): Application[] {
  const q = searchRaw.trim().toLowerCase();
  if (!q) {
    return applications.slice();
  }
  return applications.filter(
    (a) =>
      a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
  );
}

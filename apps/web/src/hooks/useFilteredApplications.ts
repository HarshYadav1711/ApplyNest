import { useMemo } from "react";
import type { Application } from "../types/application";
import { filterApplicationsBySearch } from "../utils/filterApplications";
import { useDebouncedValue } from "./useDebouncedValue";

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Client-side filter by company/role substring (case-insensitive) with debounced query.
 * Does not mutate the source array.
 */
export function useFilteredApplications(
  applications: Application[],
  searchInput: string
): {
  filteredApplications: Application[];
  debouncedSearch: string;
} {
  const debouncedSearch = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);

  const filteredApplications = useMemo(
    () => filterApplicationsBySearch(applications, debouncedSearch),
    [applications, debouncedSearch]
  );

  return { filteredApplications, debouncedSearch };
}

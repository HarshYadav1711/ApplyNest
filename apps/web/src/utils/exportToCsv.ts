import type { Application } from "../types/application";
import { formatAppliedDate } from "./dateFormat";

const FILENAME = "applynest-applications.csv";

/** RFC 4180–style: quote fields that contain comma, quote, or newline; escape " as "". */
export function escapeCsvField(value: string): string {
  const normalized = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

const HEADER = [
  "company",
  "role",
  "status",
  "dateApplied",
  "notes",
  "salaryRange",
] as const;

/**
 * Build CSV text for the given applications (full list from the client).
 * UTF-8 BOM prepended so Excel opens special characters reliably.
 */
export function applicationsToCsv(applications: Application[]): string {
  const lines: string[] = [HEADER.join(",")];

  for (const a of applications) {
    const row = [
      escapeCsvField(a.company),
      escapeCsvField(a.role),
      escapeCsvField(a.status),
      escapeCsvField(formatAppliedDate(a.dateApplied)),
      escapeCsvField(a.notes ?? ""),
      escapeCsvField((a.salaryRange ?? "").trim()),
    ];
    lines.push(row.join(","));
  }

  return `\uFEFF${lines.join("\r\n")}`;
}

/** Trigger a browser download of the CSV file. */
export function downloadApplicationsCsv(applications: Application[]): void {
  const csv = applicationsToCsv(applications);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = FILENAME;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

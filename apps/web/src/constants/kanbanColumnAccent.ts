import type { ApplicationStatus } from "./applicationStatus";

/** Minimal top accent so pipeline columns read as distinct stages. */
export const KANBAN_COLUMN_TOP: Record<ApplicationStatus, string> = {
  Applied: "border-t-[3px] border-t-slate-500/65",
  "Phone Screen": "border-t-[3px] border-t-sky-500/60",
  Interview: "border-t-[3px] border-t-violet-500/55",
  Offer: "border-t-[3px] border-t-emerald-500/60",
  Rejected: "border-t-[3px] border-t-rose-400/65",
};

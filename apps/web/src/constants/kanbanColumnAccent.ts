import type { ApplicationStatus } from "./applicationStatus";

/** Minimal top accent so pipeline columns read as distinct stages. */
export const KANBAN_COLUMN_TOP: Record<ApplicationStatus, string> = {
  Applied: "border-t-[3px] border-t-slate-500/65",
  "Phone Screen": "border-t-[3px] border-t-sky-500/60",
  Interview: "border-t-[3px] border-t-violet-500/55",
  Offer: "border-t-[3px] border-t-emerald-500/60",
  Rejected: "border-t-[3px] border-t-rose-400/65",
};

/** Summary metrics — left accent aligned with column stages. */
export const APPLICATION_STATUS_STAT_ACCENT: Record<ApplicationStatus, string> = {
  Applied: "border-l-[3px] border-l-slate-500/65 bg-slate-50/80",
  "Phone Screen": "border-l-[3px] border-l-sky-500/60 bg-sky-50/50",
  Interview: "border-l-[3px] border-l-violet-500/55 bg-violet-50/40",
  Offer: "border-l-[3px] border-l-emerald-500/60 bg-emerald-50/45",
  Rejected: "border-l-[3px] border-l-rose-400/65 bg-rose-50/50",
};

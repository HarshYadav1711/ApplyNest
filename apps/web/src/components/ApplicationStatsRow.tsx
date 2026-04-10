import { APPLICATION_STATUSES } from "../constants/applicationStatus";
import { APPLICATION_STATUS_STAT_ACCENT } from "../constants/kanbanColumnAccent";
import { cn } from "../utils/cn";
import type { ApplicationStats } from "../utils/getApplicationStats";

type Props = {
  stats: ApplicationStats;
};

export function ApplicationStatsRow({ stats }: Props) {
  return (
    <div
      className="mb-6 flex flex-wrap gap-2.5"
      aria-label="Application pipeline summary"
    >
      <div
        className={cn(
          "min-w-[5.5rem] rounded-lg border border-slate-200/90 bg-white px-3 py-2 shadow-sm shadow-slate-900/[0.03]",
        )}
      >
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
          Total
        </p>
        <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
          {stats.total}
        </p>
      </div>
      {APPLICATION_STATUSES.map((status) => (
        <div
          key={status}
          className={cn(
            "min-w-[6.5rem] rounded-lg border border-slate-200/70 px-3 py-2 shadow-sm shadow-slate-900/[0.03]",
            APPLICATION_STATUS_STAT_ACCENT[status],
          )}
        >
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-600">
            {status}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
            {stats.byStatus[status]}
          </p>
        </div>
      ))}
    </div>
  );
}

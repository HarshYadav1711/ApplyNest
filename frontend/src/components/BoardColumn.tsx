import { useDroppable } from "@dnd-kit/core";
import type { ApplicationStatus } from "../constants/statuses";
import type { ApplicationDto } from "../types/api";
import { ApplicationCard } from "./ApplicationCard";

export function BoardColumn({
  status,
  applications,
  onOpenCard,
}: {
  status: ApplicationStatus;
  applications: ApplicationDto[];
  onOpenCard: (app: ApplicationDto) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-[260px] max-w-[280px] flex-1 flex-col rounded-xl bg-slate-100/80 ring-1 ring-slate-200/80">
      <div className="border-b border-slate-200/80 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {status}
        </h3>
        <p className="text-xs text-slate-400">{applications.length} cards</p>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[200px] flex-1 flex-col gap-2 p-2 ${
          isOver ? "bg-slate-200/50" : ""
        }`}
      >
        {applications.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300/80 px-2 py-6 text-center text-xs text-slate-400">
            Drop applications here
          </p>
        ) : (
          applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onOpen={onOpenCard}
            />
          ))
        )}
      </div>
    </div>
  );
}

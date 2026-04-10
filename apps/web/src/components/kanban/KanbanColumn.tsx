import { useDroppable } from "@dnd-kit/core";
import { KANBAN_COLUMN_TOP } from "../../constants/kanbanColumnAccent";
import type { ApplicationStatus } from "../../constants/applicationStatus";
import type { Application } from "../../types/application";
import { cn } from "../../utils/cn";
import { KanbanCard } from "./KanbanCard";

export function KanbanColumn({
  status,
  applications,
  onOpenCard,
}: {
  status: ApplicationStatus;
  applications: Application[];
  onOpenCard: (app: Application) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      className={cn(
        "flex min-w-[240px] max-w-[280px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/85 bg-white shadow-sm ring-1 ring-slate-900/[0.04]",
        KANBAN_COLUMN_TOP[status]
      )}
      aria-labelledby={`column-title-${status.replace(/\s+/g, "-")}`}
    >
      <header className="border-b border-slate-100 bg-slate-50/90 px-3.5 py-3">
        <h2
          id={`column-title-${status.replace(/\s+/g, "-")}`}
          className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
        >
          {status}
        </h2>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </header>
      <ul
        ref={setNodeRef}
        className={cn(
          "flex min-h-[228px] flex-1 list-none flex-col gap-2.5 p-2.5",
          isOver ? "bg-slate-100/70" : "bg-slate-50/40"
        )}
      >
        {applications.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200/90 bg-white/60 px-3 py-9 text-center text-xs leading-relaxed text-slate-500">
            Nothing here yet. Drag a card from another stage or add a new
            application.
          </li>
        ) : (
          applications.map((app) => (
            <li key={app.id}>
              <KanbanCard application={app} onOpen={onOpenCard} />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

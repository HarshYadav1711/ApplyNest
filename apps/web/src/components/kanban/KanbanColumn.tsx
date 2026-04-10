import { useDroppable } from "@dnd-kit/core";
import type { ApplicationStatus } from "../../constants/applicationStatus";
import type { Application } from "../../types/application";
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
      className="flex min-w-[240px] max-w-[280px] flex-1 flex-col rounded-xl border border-slate-200 bg-slate-100/80"
      aria-labelledby={`column-title-${status.replace(/\s+/g, "-")}`}
    >
      <header className="border-b border-slate-200/80 px-3 py-2.5">
        <h2
          id={`column-title-${status.replace(/\s+/g, "-")}`}
          className="text-xs font-semibold uppercase tracking-wide text-slate-700"
        >
          {status}
        </h2>
        <p className="text-xs text-slate-500">
          {applications.length}{" "}
          {applications.length === 1 ? "application" : "applications"}
        </p>
      </header>
      <ul
        ref={setNodeRef}
        className={`flex min-h-[220px] flex-1 list-none flex-col gap-2 p-2 ${
          isOver ? "bg-slate-200/40" : ""
        }`}
      >
        {applications.length === 0 ? (
          <li className="rounded-md border border-dashed border-slate-300/90 px-2 py-9 text-center text-xs leading-relaxed text-slate-500">
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

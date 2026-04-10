import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Application } from "../../types/application";
import { formatAppliedDate } from "../../utils/dateFormat";

export function KanbanCard({
  application,
  onOpen,
}: {
  application: Application;
  onOpen: (app: Application) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
      data: { application },
    });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="flex gap-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm ring-1 ring-slate-900/5">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded px-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
          aria-label={`Move ${application.company}, ${application.role}`}
          {...listeners}
          {...attributes}
        >
          <span className="block text-xs leading-none" aria-hidden="true">
            ⋮⋮
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="w-full text-left"
            title={`${application.company} — ${application.role}`}
            onClick={() => onOpen(application)}
          >
            <p className="truncate font-medium text-slate-900">
              {application.company}
            </p>
            <p className="truncate text-sm text-slate-600">{application.role}</p>
            <p className="mt-1.5 text-xs text-slate-500">
              Applied {formatAppliedDate(application.dateApplied)}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

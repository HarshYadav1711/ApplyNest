import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useLayoutEffect, useRef } from "react";
import type { Application } from "../../types/application";
import { cn } from "../../utils/cn";
import { formatAppliedDate } from "../../utils/dateFormat";
import { getFollowUpBadgeState } from "../../utils/followUpReminder";

const KANBAN_DND_VAR = "--kanban-dnd-transform";

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

  const rootRef = useRef<HTMLDivElement | null>(null);

  const followUp = getFollowUpBadgeState(application.followUpDate);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      rootRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (transform) {
      const matrix = CSS.Transform.toString(transform);
      if (matrix) {
        el.style.setProperty(KANBAN_DND_VAR, matrix);
      } else {
        el.style.removeProperty(KANBAN_DND_VAR);
      }
    } else {
      el.style.removeProperty(KANBAN_DND_VAR);
    }
  }, [transform]);

  return (
    <div
      ref={setRefs}
      className={cn(
        "kanban-draggable-root touch-none",
        isDragging && "opacity-60"
      )}
    >
      <div className="flex gap-2.5 rounded-lg border border-slate-200/90 bg-white p-3 shadow-sm ring-1 ring-slate-900/[0.04] transition-shadow duration-150 hover:border-slate-300/80 hover:shadow-md">
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
            <div className="flex items-start justify-between gap-2">
              <p className="truncate font-medium text-slate-900">
                {application.company}
              </p>
              {followUp ? (
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight",
                    followUp === "overdue" &&
                      "border border-red-200/90 bg-red-50 text-red-800",
                    followUp === "dueToday" &&
                      "border border-amber-200/90 bg-amber-50 text-amber-900"
                  )}
                >
                  {followUp === "overdue" ? "🔴 Overdue" : "🟡 Due today"}
                </span>
              ) : null}
            </div>
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

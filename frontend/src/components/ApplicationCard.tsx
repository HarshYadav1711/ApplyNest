import { useDraggable } from "@dnd-kit/core";
import type { ApplicationDto } from "../types/api";

export function ApplicationCard({
  application,
  onOpen,
}: {
  application: ApplicationDto;
  onOpen: (app: ApplicationDto) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: application.id,
      data: { application },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`flex gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm ring-1 ring-slate-900/5 ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing"
        aria-label="Drag to move"
        {...listeners}
      >
        <span className="text-xs leading-none">⋮⋮</span>
      </button>
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onOpen(application)}
      >
        <p className="truncate font-medium text-slate-900">
          {application.companyName}
        </p>
        <p className="truncate text-sm text-slate-600">
          {application.positionTitle}
        </p>
        {application.location ? (
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {application.location}
          </p>
        ) : null}
      </button>
    </div>
  );
}

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useMemo, useState } from "react";
import { APPLICATION_STATUSES } from "../../constants/applicationStatus";
import type { ApplicationStatus } from "../../constants/applicationStatus";
import type { Application } from "../../types/application";
import { groupApplicationsByStatus } from "../../utils/groupApplicationsByStatus";
import { KanbanCard } from "./KanbanCard";
import { KanbanColumn } from "./KanbanColumn";

function resolveDropStatus(
  overId: string,
  appsById: Map<string, Application>
): ApplicationStatus | null {
  if (
    (APPLICATION_STATUSES as readonly string[]).includes(overId)
  ) {
    return overId as ApplicationStatus;
  }
  const overApp = appsById.get(overId);
  return overApp ? overApp.status : null;
}

export function KanbanBoard({
  applications,
  onStatusChange,
  onOpenCard,
}: {
  applications: Application[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onOpenCard: (app: Application) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (!announcement) return;
    const t = window.setTimeout(() => setAnnouncement(""), 800);
    return () => window.clearTimeout(t);
  }, [announcement]);

  const appsById = useMemo(() => {
    const m = new Map<string, Application>();
    for (const a of applications) m.set(a.id, a);
    return m;
  }, [applications]);

  const grouped = useMemo(
    () => groupApplicationsByStatus(applications),
    [applications]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeApp = activeId ? appsById.get(activeId) : undefined;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const app = appsById.get(String(active.id));
    if (!app) return;
    const target = resolveDropStatus(String(over.id), appsById);
    if (!target || target === app.status) return;
    onStatusChange(app.id, target);
    setAnnouncement(
      `Moved ${app.company} to ${target}. Status updated.`
    );
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="flex gap-3 overflow-x-auto pb-2"
        role="region"
        aria-label="Application pipeline"
      >
        {APPLICATION_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={grouped[status]}
            onOpenCard={onOpenCard}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeApp ? (
          <div className="w-[260px] opacity-95">
            <KanbanCard
              application={activeApp}
              onOpen={() => {
                /* overlay preview — no action */
              }}
            />
          </div>
        ) : null}
      </DragOverlay>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic>
        {announcement}
      </div>
    </DndContext>
  );
}

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMemo, useState } from "react";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "../constants/statuses";
import type { ApplicationDto } from "../types/api";
import { BoardColumn } from "./BoardColumn";
import { ApplicationCard } from "./ApplicationCard";

function groupByStatus(
  apps: ApplicationDto[]
): Record<ApplicationStatus, ApplicationDto[]> {
  const init = {} as Record<ApplicationStatus, ApplicationDto[]>;
  for (const s of APPLICATION_STATUSES) init[s] = [];
  for (const a of apps) {
    if (init[a.status]) init[a.status].push(a);
  }
  for (const s of APPLICATION_STATUSES) {
    init[s].sort(
      (x, y) =>
        new Date(y.updatedAt).getTime() - new Date(x.updatedAt).getTime()
    );
  }
  return init;
}

function resolveDropStatus(
  overId: string,
  appsById: Map<string, ApplicationDto>
): ApplicationStatus | null {
  if (APPLICATION_STATUSES.includes(overId as ApplicationStatus)) {
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
  applications: ApplicationDto[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onOpenCard: (app: ApplicationDto) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const appsById = useMemo(() => {
    const m = new Map<string, ApplicationDto>();
    for (const a of applications) m.set(a.id, a);
    return m;
  }, [applications]);

  const grouped = useMemo(() => groupByStatus(applications), [applications]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {APPLICATION_STATUSES.map((status) => (
          <BoardColumn
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
            <ApplicationCard application={activeApp} onOpen={() => undefined} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

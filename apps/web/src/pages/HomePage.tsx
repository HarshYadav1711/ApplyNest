import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApplicationModal } from "../components/ApplicationModal";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  EmptyStatePanel,
  FilterEmptyPanel,
  PageLoading,
  QueryErrorPanel,
} from "../components/ui/PageStatus";
import { Select } from "../components/ui/Select";
import {
  useApplicationMutations,
  useApplicationsList,
} from "../hooks/useApplications";
import type { Application } from "../types/application";
import type { ApplicationStatus } from "../constants/applicationStatus";
import { APPLICATION_STATUSES } from "../constants/applicationStatus";
import { getApiErrorMessage } from "../utils/apiError";
import {
  filterApplications,
  type StatusFilter,
} from "../utils/filterApplications";
import { DemoJobSamples } from "../components/demo/DemoJobSamples";

export function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const appsQuery = useApplicationsList(isAuthenticated);
  const { create, update, moveToStatus, remove } = useApplicationMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Application | null>(null);
  const [createJdPreset, setCreateJdPreset] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const applications = appsQuery.data ?? [];

  const filteredApplications = useMemo(
    () =>
      filterApplications(appsQuery.data ?? [], search, statusFilter),
    [appsQuery.data, search, statusFilter]
  );

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  function openCreate() {
    setCreateJdPreset("");
    setModalKey((k) => k + 1);
    setModalMode("create");
    setSelected(null);
    setModalOpen(true);
  }

  function openCreateWithDemoJd(text: string) {
    setCreateJdPreset(text);
    setModalKey((k) => k + 1);
    setModalMode("create");
    setSelected(null);
    setModalOpen(true);
  }

  function openEdit(app: Application) {
    setModalKey((k) => k + 1);
    setModalMode("edit");
    setSelected(app);
    setModalOpen(true);
  }

  const listErrorMessage = getApiErrorMessage(
    appsQuery.error,
    "Something went wrong while loading your applications."
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/90 bg-white shadow-sm shadow-slate-900/5">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                ApplyNest
              </p>
              <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                Application pipeline
              </h1>
              <p className="mt-0.5 truncate text-sm text-slate-600">
                {user?.email}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <Button type="button" variant="primary" onClick={openCreate}>
                Add application
              </Button>
              <Button type="button" variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <label
                  className="sr-only"
                  htmlFor="pipeline-search"
                >
                  Search applications
                </label>
                <Input
                  id="pipeline-search"
                  type="search"
                  autoComplete="off"
                  placeholder="Search by company, role, or location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:max-w-md"
                />
              </div>
              <div className="w-full sm:w-52">
                <label className="sr-only" htmlFor="pipeline-stage">
                  Filter by stage
                </label>
                <Select
                  id="pipeline-stage"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  aria-label="Filter by stage"
                >
                  <option value="all">All stages</option>
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              {hasActiveFilters ? (
                <p className="text-xs text-slate-500 sm:pb-2">
                  Showing {filteredApplications.length} of {applications.length}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        {appsQuery.isLoading ? (
          <PageLoading message="Loading your applications…" />
        ) : appsQuery.isError ? (
          <QueryErrorPanel
            title="Could not load applications"
            message={listErrorMessage}
            onRetry={() => void appsQuery.refetch()}
            retryLabel="Retry"
          />
        ) : applications.length === 0 ? (
          <EmptyStatePanel
            title="No applications yet"
            description="Track every role in one place. Add your first application to build your pipeline."
            action={
              <Button type="button" variant="primary" onClick={openCreate}>
                Add application
              </Button>
            }
            footer={<DemoJobSamples onPick={openCreateWithDemoJd} />}
          />
        ) : applications.length > 0 && filteredApplications.length === 0 ? (
          <FilterEmptyPanel onClear={clearFilters} />
        ) : (
          <div>
            <KanbanBoard
              applications={filteredApplications}
              onStatusChange={(id, status: ApplicationStatus) => {
                moveToStatus.mutate({ id, status });
              }}
              onOpenCard={openEdit}
            />
            <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
              Drag a card by the handle to change its stage. Click a card to view
              or edit. Updates save automatically.
            </p>
          </div>
        )}
      </main>

      {modalOpen ? (
        <ApplicationModal
          key={modalKey}
          mode={modalMode}
          initial={selected}
          initialJdPaste={
            modalMode === "create" ? createJdPreset : undefined
          }
          onClose={() => setModalOpen(false)}
          onCreate={async (payload) => {
            await create.mutateAsync(payload);
          }}
          onUpdate={async (id, payload) => {
            await update.mutateAsync({ id, body: payload });
          }}
          onDelete={async (id) => {
            await remove.mutateAsync(id);
          }}
        />
      ) : null}
    </div>
  );
}

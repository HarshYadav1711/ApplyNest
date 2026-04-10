import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApplicationModal } from "../components/ApplicationModal";
import { KanbanBoard } from "../components/kanban/KanbanBoard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  EmptyStatePanel,
  PageLoading,
  QueryErrorPanel,
} from "../components/ui/PageStatus";
import { useFilteredApplications } from "../hooks/useFilteredApplications";
import {
  useApplicationMutations,
  useApplicationsList,
} from "../hooks/useApplications";
import type { Application } from "../types/application";
import type { ApplicationStatus } from "../constants/applicationStatus";
import { getApiErrorMessage } from "../utils/apiError";
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

  const [boardSearch, setBoardSearch] = useState("");

  const applications = appsQuery.data ?? [];

  const { filteredApplications, debouncedSearch } = useFilteredApplications(
    applications,
    boardSearch
  );

  const hasNoSearchMatches =
    applications.length > 0 &&
    filteredApplications.length === 0 &&
    debouncedSearch.length > 0;

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
    <div className="min-h-screen bg-slate-50/95">
      <header className="border-b border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.04]">
        <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                ApplyNest
              </p>
              <h1 className="mt-1.5 text-base font-semibold tracking-tight text-slate-900">
                Application pipeline
              </h1>
              <p className="mt-1 truncate text-sm text-slate-600">
                {user?.email}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5">
              <Button type="button" variant="primary" onClick={openCreate}>
                Add application
              </Button>
              <Button type="button" variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-10 sm:px-8">
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
        ) : (
          <div>
            <div className="mb-5 flex max-w-md flex-col gap-1.5">
              <label
                className="text-xs font-medium text-slate-600"
                htmlFor="board-search"
              >
                Search
              </label>
              <Input
                id="board-search"
                type="search"
                autoComplete="off"
                placeholder="Filter by company or role"
                value={boardSearch}
                onChange={(e) => setBoardSearch(e.target.value)}
                aria-describedby="board-search-hint"
              />
              <p id="board-search-hint" className="text-xs text-slate-500">
                Matches company and role; updates shortly after you stop typing.
              </p>
            </div>

            {hasNoSearchMatches ? (
              <div
                className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/60 py-14 text-center"
                role="status"
              >
                <p className="text-sm text-slate-600">No results found.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Try another term or clear the search.
                </p>
              </div>
            ) : (
              <>
                <KanbanBoard
                  applications={filteredApplications}
                  onStatusChange={(id, status: ApplicationStatus) => {
                    moveToStatus.mutate({ id, status });
                  }}
                  onOpenCard={openEdit}
                />
                <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-slate-500">
                  Drag a card by the handle to change its stage. Click a card to
                  view or edit. Updates save automatically.
                </p>
              </>
            )}
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

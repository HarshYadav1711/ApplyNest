import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApplicationFormModal } from "../components/ApplicationFormModal";
import { KanbanBoard } from "../components/KanbanBoard";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { useApplicationMutation, useApplicationsList } from "../hooks/useApplicationsQuery";
import type { ApplicationDto } from "../types/api";

export function BoardPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const appsQuery = useApplicationsList(isAuthenticated);
  const { create, update, updateStatus, remove } = useApplicationMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ApplicationDto | null>(null);
  const [modalKey, setModalKey] = useState(0);

  const applications = appsQuery.data ?? [];

  function openCreate() {
    setModalKey((k) => k + 1);
    setModalMode("create");
    setSelected(null);
    setModalOpen(true);
  }

  function openEdit(app: ApplicationDto) {
    setModalKey((k) => k + 1);
    setModalMode("edit");
    setSelected(app);
    setModalOpen(true);
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ApplyNest
            </p>
            <h1 className="text-lg font-semibold text-slate-900">
              Application pipeline
            </h1>
            {user ? (
              <p className="text-sm text-slate-500">{user.email}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={openCreate}>
              New application
            </Button>
            <Button variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {appsQuery.isLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-24 text-slate-600"
            role="status"
            aria-live="polite"
          >
            <Spinner />
            <p className="text-sm">Loading your board…</p>
          </div>
        ) : appsQuery.isError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            role="alert"
          >
            <p className="font-medium text-red-800">Could not load applications</p>
            <p className="mt-1 text-sm text-red-700">
              {appsQuery.error instanceof Error
                ? appsQuery.error.message
                : "Something went wrong."}
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => void appsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No applications yet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track roles you care about in one place. Add your first card or
              paste a job description to let AI prefill the form.
            </p>
            <Button className="mt-6" variant="primary" onClick={openCreate}>
              Add application
            </Button>
          </div>
        ) : (
          <KanbanBoard
            applications={applications}
            onOpenCard={openEdit}
            onStatusChange={(id, status) => {
              void updateStatus.mutateAsync({ id, status });
            }}
          />
        )}
      </main>

      <ApplicationFormModal
        key={modalKey}
        open={modalOpen}
        mode={modalMode}
        initial={selected}
        onClose={() => setModalOpen(false)}
        onCreate={async (values) => {
          await create.mutateAsync({
            companyName: values.companyName,
            positionTitle: values.positionTitle,
            jobUrl: values.jobUrl || undefined,
            location: values.location,
            notes: values.notes,
            parsedSummary: values.parsedSummary,
            requiredSkills: values.requiredSkills,
            status: values.status,
          });
        }}
        onUpdate={async (id, values) => {
          await update.mutateAsync({
            id,
            body: {
              companyName: values.companyName,
              positionTitle: values.positionTitle,
              jobUrl: values.jobUrl || undefined,
              location: values.location,
              notes: values.notes,
              parsedSummary: values.parsedSummary,
              requiredSkills: values.requiredSkills,
              status: values.status,
            },
          });
        }}
        onDelete={async (id) => {
          await remove.mutateAsync(id);
        }}
      />
    </div>
  );
}

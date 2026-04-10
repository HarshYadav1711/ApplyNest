import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ApplicationModal } from "../components/ApplicationModal";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { useApplicationMutations, useApplicationsList } from "../hooks/useApplications";
import type { Application } from "../types/application";
import { formatAppliedDate } from "../utils/dateFormat";

export function HomePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const appsQuery = useApplicationsList(isAuthenticated);
  const { create, update, remove } = useApplicationMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<Application | null>(null);

  const applications = appsQuery.data ?? [];

  function openCreate() {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ApplyNest
            </p>
            <p className="text-sm text-slate-600">{user?.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="primary" onClick={openCreate}>
              Add application
            </Button>
            <Button type="button" variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {appsQuery.isLoading ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-20 text-slate-600"
            role="status"
            aria-live="polite"
          >
            <Spinner />
            <p className="text-sm">Loading applications…</p>
          </div>
        ) : appsQuery.isError ? (
          <div
            className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
            role="alert"
          >
            <p className="font-medium text-red-800">
              Could not load applications
            </p>
            <p className="mt-1 text-sm text-red-700">
              {appsQuery.error instanceof Error
                ? appsQuery.error.message
                : "Something went wrong."}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => void appsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              No applications yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Track every role in one place. Add your first application to get
              started.
            </p>
            <Button
              type="button"
              className="mt-6"
              variant="primary"
              onClick={openCreate}
            >
              Add application
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Applied</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">JD link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => openEdit(app)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {app.company}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-slate-700">
                        {app.role}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {formatAppliedDate(app.dateApplied)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                          {app.status}
                        </span>
                      </td>
                      <td className="max-w-[180px] px-4 py-3">
                        {app.jdLink ? (
                          <a
                            href={app.jdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-slate-700 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open posting
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="border-t border-slate-100 px-4 py-2 text-center text-xs text-slate-500">
              Click a row to view or edit
            </p>
          </div>
        )}
      </main>

      {modalOpen ? (
        <ApplicationModal
          key={modalKey}
          mode={modalMode}
          initial={selected}
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

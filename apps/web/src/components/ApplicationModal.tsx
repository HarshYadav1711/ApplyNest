import { useState } from "react";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "../constants/applicationStatus";
import type { Application } from "../types/application";
import { getApiErrorMessage } from "../utils/apiError";
import {
  isoToDateInputValue,
  todayDateInputValue,
} from "../utils/dateFormat";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Textarea } from "./ui/Textarea";

export interface ApplicationFormValues {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
}

function emptyForm(): ApplicationFormValues {
  return {
    company: "",
    role: "",
    jdLink: "",
    notes: "",
    dateApplied: todayDateInputValue(),
    status: "Applied",
    salaryRange: "",
  };
}

function fromApplication(app: Application): ApplicationFormValues {
  return {
    company: app.company,
    role: app.role,
    jdLink: app.jdLink,
    notes: app.notes,
    dateApplied: isoToDateInputValue(app.dateApplied),
    status: app.status,
    salaryRange: app.salaryRange,
  };
}

function toPayload(values: ApplicationFormValues): {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
} {
  const dateApplied = new Date(
    values.dateApplied + "T12:00:00"
  ).toISOString();
  return {
    company: values.company.trim(),
    role: values.role.trim(),
    jdLink: values.jdLink.trim(),
    notes: values.notes,
    dateApplied,
    status: values.status,
    salaryRange: values.salaryRange.trim(),
  };
}

export function ApplicationModal({
  mode,
  initial,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  mode: "create" | "edit";
  initial: Application | null;
  onClose: () => void;
  onCreate: (payload: ReturnType<typeof toPayload>) => Promise<void>;
  onUpdate: (
    id: string,
    payload: ReturnType<typeof toPayload>
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState<ApplicationFormValues>(() =>
    mode === "edit" && initial ? fromApplication(initial) : emptyForm()
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync when parent remounts with new key — initial state set in useState initializer only.
  // Parent must change `key` when opening a different application.

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.company.trim() || !form.role.trim()) {
      setFormError("Company and role are required.");
      return;
    }
    const payload = toPayload(form);
    setSaving(true);
    try {
      if (mode === "create") {
        await onCreate(payload);
      } else if (initial) {
        await onUpdate(initial.id, payload);
      }
      onClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not save."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial || mode !== "edit") return;
    if (
      !window.confirm(
        "Delete this application? This cannot be undone."
      )
    ) {
      return;
    }
    setFormError(null);
    setDeleting(true);
    try {
      await onDelete(initial.id);
      onClose();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not delete."));
    } finally {
      setDeleting(false);
    }
  }

  const title =
    mode === "create" ? "New application" : "Edit application";

  return (
    <Modal open={true} title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="app-company"
          >
            Company
          </label>
          <Input
            id="app-company"
            required
            className="mt-1"
            value={form.company}
            onChange={(e) =>
              setForm((f) => ({ ...f, company: e.target.value }))
            }
            disabled={saving || deleting}
            autoComplete="organization"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600" htmlFor="app-role">
            Role
          </label>
          <Input
            id="app-role"
            required
            className="mt-1"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="app-jd-link"
          >
            Job description link
          </label>
          <Input
            id="app-jd-link"
            type="url"
            inputMode="url"
            placeholder="https://"
            className="mt-1"
            value={form.jdLink}
            onChange={(e) =>
              setForm((f) => ({ ...f, jdLink: e.target.value }))
            }
            disabled={saving || deleting}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="app-date"
            >
              Date applied
            </label>
            <Input
              id="app-date"
              type="date"
              required
              className="mt-1"
              value={form.dateApplied}
              onChange={(e) =>
                setForm((f) => ({ ...f, dateApplied: e.target.value }))
              }
              disabled={saving || deleting}
            />
          </div>
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="app-status"
            >
              Status
            </label>
            <select
              id="app-status"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ApplicationStatus,
                }))
              }
              disabled={saving || deleting}
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="app-salary"
          >
            Salary range{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <Input
            id="app-salary"
            className="mt-1"
            placeholder="e.g. $120k – $150k"
            value={form.salaryRange}
            onChange={(e) =>
              setForm((f) => ({ ...f, salaryRange: e.target.value }))
            }
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600" htmlFor="app-notes">
            Notes
          </label>
          <Textarea
            id="app-notes"
            className="mt-1"
            rows={4}
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            disabled={saving || deleting}
          />
        </div>

        {formError ? (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button type="submit" disabled={saving || deleting}>
            {saving ? "Saving…" : mode === "create" ? "Create" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={saving || deleting}
            onClick={onClose}
          >
            Cancel
          </Button>
          {mode === "edit" && initial ? (
            <Button
              type="button"
              variant="danger"
              className="ml-auto"
              disabled={saving || deleting}
              onClick={() => void handleDelete()}
            >
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "../constants/applicationStatus";
import * as aiApi from "../api/ai";
import type { Application } from "../types/application";
import { getApiErrorMessage } from "../utils/apiError";
import {
  isoToDateInputValue,
  todayDateInputValue,
} from "../utils/dateFormat";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Spinner } from "./ui/Spinner";
import { Textarea } from "./ui/Textarea";

export interface ApplicationFormValues {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  status: ApplicationStatus;
  salaryRange: string;
  location: string;
  seniority: string;
  requiredSkillsText: string;
  niceToHaveSkillsText: string;
}

function skillsFromText(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
}

function skillsToText(skills: string[]): string {
  return skills.join(", ");
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
    location: "",
    seniority: "",
    requiredSkillsText: "",
    niceToHaveSkillsText: "",
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
    location: app.location ?? "",
    seniority: app.seniority ?? "",
    requiredSkillsText: skillsToText(app.requiredSkills ?? []),
    niceToHaveSkillsText: skillsToText(app.niceToHaveSkills ?? []),
  };
}

function toPayload(values: ApplicationFormValues) {
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
    location: values.location.trim(),
    seniority: values.seniority.trim(),
    requiredSkills: skillsFromText(values.requiredSkillsText),
    niceToHaveSkills: skillsFromText(values.niceToHaveSkillsText),
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
  const [jdPaste, setJdPaste] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const parseMutation = useMutation({
    mutationFn: (text: string) => aiApi.parseJobDescription(text),
    onSuccess: (parsed) => {
      setParseError(null);
      setForm((f) => ({
        ...f,
        company: parsed.company || f.company,
        role: parsed.role || f.role,
        location: parsed.location || f.location,
        seniority: parsed.seniority || f.seniority,
        requiredSkillsText:
          parsed.requiredSkills.length > 0
            ? skillsToText(parsed.requiredSkills)
            : f.requiredSkillsText,
        niceToHaveSkillsText:
          parsed.niceToHaveSkills.length > 0
            ? skillsToText(parsed.niceToHaveSkills)
            : f.niceToHaveSkillsText,
      }));
    },
    onError: (err: unknown) => {
      setParseError(
        getApiErrorMessage(err, "Could not parse job description.")
      );
    },
  });

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
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
          <label
            className="block text-xs font-medium text-slate-600"
            htmlFor="jd-paste"
          >
            Paste job description
          </label>
          <Textarea
            id="jd-paste"
            className="mt-1 font-mono text-xs"
            rows={5}
            value={jdPaste}
            placeholder="Paste the posting text (at least 20 characters), then parse to fill fields below."
            onChange={(e) => {
              setJdPaste(e.target.value);
              setParseError(null);
            }}
            disabled={saving || deleting || parseMutation.isPending}
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={
                jdPaste.trim().length < 20 ||
                parseMutation.isPending ||
                saving ||
                deleting
              }
              onClick={() => parseMutation.mutate(jdPaste)}
            >
              {parseMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4 border-t-slate-700" />
                  Parsing…
                </span>
              ) : (
                "Parse"
              )}
            </Button>
            {parseError ? (
              <span className="text-xs text-red-600" role="alert">
                {parseError}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Uses AI when an API key is configured; otherwise a local fallback
            extracts what it can.
          </p>
        </div>

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
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="app-location"
            >
              Location
            </label>
            <Input
              id="app-location"
              className="mt-1"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              disabled={saving || deleting}
            />
          </div>
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="app-seniority"
            >
              Seniority
            </label>
            <Input
              id="app-seniority"
              className="mt-1"
              placeholder="e.g. Senior"
              value={form.seniority}
              onChange={(e) =>
                setForm((f) => ({ ...f, seniority: e.target.value }))
              }
              disabled={saving || deleting}
            />
          </div>
        </div>
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="app-required-skills"
          >
            Required skills
          </label>
          <Textarea
            id="app-required-skills"
            className="mt-1 text-sm"
            rows={2}
            placeholder="Comma or line separated"
            value={form.requiredSkillsText}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                requiredSkillsText: e.target.value,
              }))
            }
            disabled={saving || deleting}
          />
        </div>
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="app-nice-skills"
          >
            Nice-to-have skills
          </label>
          <Textarea
            id="app-nice-skills"
            className="mt-1 text-sm"
            rows={2}
            placeholder="Comma or line separated"
            value={form.niceToHaveSkillsText}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                niceToHaveSkillsText: e.target.value,
              }))
            }
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

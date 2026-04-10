import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { ResumeBulletsSource } from "../types/resumeBullets";
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
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Select } from "./ui/Select";
import { Spinner } from "./ui/Spinner";
import { Textarea } from "./ui/Textarea";

export interface ApplicationFormValues {
  company: string;
  role: string;
  jdLink: string;
  notes: string;
  dateApplied: string;
  followUpDate: string;
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
    followUpDate: "",
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
    followUpDate: app.followUpDate
      ? isoToDateInputValue(app.followUpDate)
      : "",
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
  const followUpDate = values.followUpDate.trim()
    ? new Date(values.followUpDate + "T12:00:00").toISOString()
    : null;
  return {
    company: values.company.trim(),
    role: values.role.trim(),
    jdLink: values.jdLink.trim(),
    notes: values.notes,
    dateApplied,
    followUpDate,
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
  initialJdPaste = "",
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  mode: "create" | "edit";
  initial: Application | null;
  /** Pre-fills the JD paste area when creating (e.g. demo samples). */
  initialJdPaste?: string;
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
  const [jdPaste, setJdPaste] = useState(
    () => (mode === "create" ? initialJdPaste : "") ?? ""
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [resumeBullets, setResumeBullets] = useState<string[] | null>(null);
  const [resumeSource, setResumeSource] = useState<ResumeBulletsSource | null>(
    null
  );
  const [bulletsError, setBulletsError] = useState<string | null>(null);
  const [copiedBulletIndex, setCopiedBulletIndex] = useState<number | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const parseMutation = useMutation({
    mutationFn: (text: string) => aiApi.parseJobDescription(text),
    onSuccess: (parsed) => {
      setParseError(null);
      setResumeBullets(null);
      setResumeSource(null);
      setBulletsError(null);
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

  const bulletsMutation = useMutation({
    mutationFn: () =>
      aiApi.fetchResumeBullets({
        jobDescriptionText: jdPaste.trim(),
        role: form.role.trim(),
        company: form.company.trim(),
        requiredSkills: skillsFromText(form.requiredSkillsText),
        niceToHaveSkills: skillsFromText(form.niceToHaveSkillsText),
      }),
    onSuccess: (data) => {
      setBulletsError(null);
      setResumeBullets(data.bullets);
      setResumeSource(data.source);
    },
    onError: (err: unknown) => {
      setBulletsError(
        getApiErrorMessage(
          err,
          "Could not generate resume bullet suggestions."
        )
      );
      setResumeBullets(null);
      setResumeSource(null);
    },
  });

  async function handleCopyBullet(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBulletIndex(index);
      window.setTimeout(() => {
        setCopiedBulletIndex((cur) => (cur === index ? null : cur));
      }, 2000);
    } catch {
      setBulletsError("Could not copy to clipboard.");
    }
  }

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
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/90 p-4 shadow-sm ring-1 ring-slate-900/[0.03]">
          <label
            className="block text-xs font-medium text-slate-600"
            htmlFor="jd-paste"
          >
            Paste job description
          </label>
          <Textarea
            id="jd-paste"
            className="mt-1.5 font-mono text-xs"
            rows={5}
            value={jdPaste}
            placeholder="Paste the posting text (at least 20 characters), then parse to fill fields below."
            onChange={(e) => {
              setJdPaste(e.target.value);
              setParseError(null);
              setBulletsError(null);
            }}
            disabled={saving || deleting || parseMutation.isPending}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
          </div>
          {parseError ? (
            <Alert variant="danger" className="mt-2 text-xs">
              {parseError}
            </Alert>
          ) : null}
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
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
            className="mt-1.5"
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
            className="mt-1.5"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            disabled={saving || deleting}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="text-xs font-medium text-slate-600"
              htmlFor="app-location"
            >
              Location
            </label>
            <Input
              id="app-location"
              className="mt-1.5"
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
              className="mt-1.5"
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
            className="mt-1.5 text-sm"
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
            className="mt-1.5 text-sm"
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

        <div className="rounded-xl border border-violet-200/90 bg-violet-50/50 p-4 shadow-sm ring-1 ring-violet-900/[0.04]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium text-slate-800">
                Resume bullet suggestions
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                3–5 achievement lines tailored to the pasted JD, role, and
                skills. Requires at least 20 characters of JD text and a role
                title.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="shrink-0"
              disabled={
                jdPaste.trim().length < 20 ||
                !form.role.trim() ||
                bulletsMutation.isPending ||
                saving ||
                deleting ||
                parseMutation.isPending
              }
              onClick={() => bulletsMutation.mutate()}
            >
              {bulletsMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4 border-t-violet-800" />
                  Generating…
                </span>
              ) : (
                "Suggest bullets"
              )}
            </Button>
          </div>
          {resumeSource === "fallback" && resumeBullets && resumeBullets.length > 0 ? (
            <Alert variant="warning" className="mt-2 text-xs" role="status">
              Using deterministic templates (no{" "}
              <code className="rounded bg-white/80 px-1">OPENAI_API_KEY</code>{" "}
              on the server). Add a key for AI-authored bullets grounded in the
              posting.
            </Alert>
          ) : null}
          {bulletsError ? (
            <Alert variant="danger" className="mt-2 text-xs">
              {bulletsError}
            </Alert>
          ) : null}
          {resumeBullets && resumeBullets.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {resumeBullets.map((bullet, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-md border border-violet-100 bg-white/90 p-2.5 shadow-sm"
                >
                  <p className="min-w-0 flex-1 text-sm leading-snug text-slate-800">
                    {bullet}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 shrink-0 px-2 py-1 text-xs"
                    aria-label={`Copy resume bullet ${i + 1}`}
                    disabled={saving || deleting}
                    onClick={() => void handleCopyBullet(bullet, i)}
                  >
                    {copiedBulletIndex === i ? "Copied" : "Copy"}
                  </Button>
                </li>
              ))}
            </ul>
          ) : !bulletsMutation.isPending && !bulletsError ? (
            <p className="mt-2 text-xs text-slate-500">
              Suggestions appear here after you run{" "}
              <span className="font-medium text-slate-700">Suggest bullets</span>
              .
            </p>
          ) : null}
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
            className="mt-1.5"
            value={form.jdLink}
            onChange={(e) =>
              setForm((f) => ({ ...f, jdLink: e.target.value }))
            }
            disabled={saving || deleting}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
              className="mt-1.5"
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
            <Select
              id="app-status"
              className="mt-1.5"
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
            </Select>
          </div>
        </div>
        <div>
          <label
            className="text-xs font-medium text-slate-600"
            htmlFor="app-follow-up"
          >
            Follow-up{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <Input
            id="app-follow-up"
            type="date"
            className="mt-1.5"
            value={form.followUpDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, followUpDate: e.target.value }))
            }
            disabled={saving || deleting}
          />
          <p className="mt-1 text-xs text-slate-500">
            Reminder date — the card shows when it&apos;s due today or overdue.
          </p>
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
            className="mt-1.5"
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
            className="mt-1.5"
            rows={4}
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
            disabled={saving || deleting}
          />
        </div>

        {formError ? <Alert variant="danger">{formError}</Alert> : null}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-6">
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

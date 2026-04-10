import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import * as aiApi from "../api/ai";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "../constants/statuses";
import type { ApplicationDto } from "../types/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Spinner } from "./ui/Spinner";
import { Textarea } from "./ui/Textarea";

const emptyForm = {
  companyName: "",
  positionTitle: "",
  jobUrl: "",
  location: "",
  notes: "",
  parsedSummary: "",
  requiredSkills: [] as string[],
  status: "Applied" as ApplicationStatus,
};

function skillsToText(skills: string[]): string {
  return skills.join(", ");
}

function textToSkills(text: string): string[] {
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
}

function initialForm(
  mode: "create" | "edit",
  initial: ApplicationDto | null
) {
  if (mode === "edit" && initial) {
    return {
      companyName: initial.companyName,
      positionTitle: initial.positionTitle,
      jobUrl: initial.jobUrl,
      location: initial.location,
      notes: initial.notes,
      parsedSummary: initial.parsedSummary,
      requiredSkills: initial.requiredSkills,
      status: initial.status,
    };
  }
  return { ...emptyForm };
}

function initialSkillsText(
  mode: "create" | "edit",
  initial: ApplicationDto | null
) {
  if (mode === "edit" && initial) {
    return skillsToText(initial.requiredSkills);
  }
  return "";
}

export function ApplicationFormModal({
  open,
  mode,
  initial,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: {
  open: boolean;
  mode: "create" | "edit";
  initial: ApplicationDto | null;
  onClose: () => void;
  onCreate: (values: {
    companyName: string;
    positionTitle: string;
    jobUrl: string;
    location: string;
    notes: string;
    parsedSummary: string;
    requiredSkills: string[];
    status: ApplicationStatus;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    values: {
      companyName: string;
      positionTitle: string;
      jobUrl: string;
      location: string;
      notes: string;
      parsedSummary: string;
      requiredSkills: string[];
      status: ApplicationStatus;
    }
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState(() => initialForm(mode, initial));
  const [jdPaste, setJdPaste] = useState("");
  const [skillsText, setSkillsText] = useState(() =>
    initialSkillsText(mode, initial)
  );
  const [bullets, setBullets] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const parseMutation = useMutation({
    mutationFn: (text: string) => aiApi.parseJobDescription(text),
    onSuccess: (parsed) => {
      setForm((f) => ({
        ...f,
        companyName: parsed.companyName || f.companyName,
        positionTitle: parsed.positionTitle || f.positionTitle,
        location: parsed.location || f.location,
        parsedSummary: parsed.summary || f.parsedSummary,
        requiredSkills:
          parsed.requiredSkills.length > 0
            ? parsed.requiredSkills
            : f.requiredSkills,
      }));
      if (parsed.requiredSkills.length > 0) {
        setSkillsText(skillsToText(parsed.requiredSkills));
      }
    },
  });

  const bulletsMutation = useMutation({
    mutationFn: () =>
      aiApi.suggestResumeBullets({
        companyName: form.companyName,
        positionTitle: form.positionTitle,
        parsedSummary: form.parsedSummary,
        requiredSkills: textToSkills(skillsText),
        notes: form.notes,
      }),
    onSuccess: (data) => setBullets(data.bullets),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const skills = textToSkills(skillsText);
    if (!form.companyName.trim() || !form.positionTitle.trim()) {
      setFormError("Company and role are required.");
      return;
    }
    const payload = {
      companyName: form.companyName.trim(),
      positionTitle: form.positionTitle.trim(),
      jobUrl: form.jobUrl.trim(),
      location: form.location.trim(),
      notes: form.notes,
      parsedSummary: form.parsedSummary,
      requiredSkills: skills,
      status: form.status,
    };
    try {
      if (mode === "create") await onCreate(payload);
      else if (initial) await onUpdate(initial.id, payload);
      onClose();
    } catch {
      setFormError("Could not save. Try again.");
    }
  }

  async function handleDelete() {
    if (!initial || mode !== "edit") return;
    if (!window.confirm("Delete this application?")) return;
    try {
      await onDelete(initial.id);
      onClose();
    } catch {
      setFormError("Could not delete. Try again.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "New application" : "Edit application"}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "create" ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
            <label className="block text-xs font-medium text-slate-600">
              Paste job description (optional)
            </label>
            <Textarea
              className="mt-1 font-mono text-xs"
              rows={5}
              value={jdPaste}
              placeholder="Paste the posting text, then parse to autofill fields."
              onChange={(e) => setJdPaste(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={
                  jdPaste.trim().length < 20 || parseMutation.isPending
                }
                onClick={() => parseMutation.mutate(jdPaste)}
              >
                {parseMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="size-4 border-t-slate-700" /> Parsing…
                  </span>
                ) : (
                  "Parse with AI"
                )}
              </Button>
              {parseMutation.isError ? (
                <span className="text-xs text-red-600">
                  Parse failed — edit fields manually.
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Company</label>
            <Input
              className="mt-1"
              required
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Role</label>
            <Input
              className="mt-1"
              required
              value={form.positionTitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, positionTitle: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Location</label>
            <Input
              className="mt-1"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Job URL</label>
            <Input
              className="mt-1"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={form.jobUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, jobUrl: e.target.value }))
              }
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Pipeline stage</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2"
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as ApplicationStatus,
              }))
            }
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Skills from JD (comma-separated)
          </label>
          <Textarea
            className="mt-1 text-sm"
            rows={2}
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">
            Parsed / role summary
          </label>
          <Textarea
            className="mt-1 text-sm"
            rows={4}
            value={form.parsedSummary}
            onChange={(e) =>
              setForm((f) => ({ ...f, parsedSummary: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Your notes</label>
          <Textarea
            className="mt-1 text-sm"
            rows={3}
            value={form.notes}
            onChange={(e) =>
              setForm((f) => ({ ...f, notes: e.target.value }))
            }
          />
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={
                !form.companyName.trim() ||
                !form.positionTitle.trim() ||
                bulletsMutation.isPending
              }
              onClick={() => bulletsMutation.mutate()}
            >
              {bulletsMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4 border-t-slate-700" /> Generating…
                </span>
              ) : (
                "Suggest resume bullets"
              )}
            </Button>
            {bulletsMutation.isError ? (
              <span className="text-xs text-red-600">
                Suggestions failed — try again.
              </span>
            ) : null}
          </div>
          {bullets.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {bullets.map((b, i) => (
                <li
                  key={`${i}-${b.slice(0, 12)}`}
                  className="flex gap-2 rounded-md bg-slate-50 p-2"
                >
                  <span className="flex-1">{b}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 px-2 py-1 text-xs"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(b);
                      } catch {
                        /* ignore */
                      }
                    }}
                  >
                    Copy
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              AI suggests bullets aligned to this role and your notes. Works
              offline with a heuristic fallback when no API key is set.
            </p>
          )}
        </div>

        {formError ? (
          <p className="text-sm text-red-600" role="alert">
            {formError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button type="submit" variant="primary">
            {mode === "create" ? "Create" : "Save changes"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {mode === "edit" && initial ? (
            <Button
              type="button"
              variant="danger"
              className="ml-auto"
              onClick={() => void handleDelete()}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}

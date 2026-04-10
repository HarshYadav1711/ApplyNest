import type { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

/** Centered loading block for pages and large regions. */
export function PageLoading({
  message = "Loading…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[min(320px,50vh)] flex-col items-center justify-center gap-4 px-4 py-16 text-slate-600",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden>
        <Spinner className="size-9 border-t-slate-800" />
      </span>
      <p className="max-w-sm text-center text-sm font-medium text-slate-500">
        {message}
      </p>
    </div>
  );
}

/** Failed query / recoverable error with retry. */
export function QueryErrorPanel({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      className="mx-auto max-w-md rounded-xl border border-red-200/90 bg-red-50/95 px-7 py-9 text-center shadow-md ring-1 ring-red-900/[0.04]"
      role="alert"
    >
      <p className="text-base font-semibold tracking-tight text-red-950">{title}</p>
      <p className="mt-2.5 text-sm leading-relaxed text-red-900/90">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="secondary"
          className="mt-7"
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

/** Empty list / onboarding CTA. */
export function EmptyStatePanel({
  title,
  description,
  action,
  footer,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  /** Optional secondary block (e.g. demo samples) — kept visually separate from the primary CTA. */
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-slate-300/80 bg-white px-10 py-16 text-center shadow-md ring-1 ring-slate-900/[0.03]">
      <h2 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-9 flex justify-center">{action}</div> : null}
      {footer ? <div className="mx-auto max-w-md">{footer}</div> : null}
    </div>
  );
}

/** Search/filter produced no rows while data exists. */
export function FilterEmptyPanel({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div
      className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-6 py-7 text-center shadow-sm ring-1 ring-amber-900/[0.04]"
      role="status"
    >
      <p className="text-sm font-semibold text-amber-950">
        No applications match your filters
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-amber-900/88">
        Try a different search or stage, or clear filters to see everything.
      </p>
      <Button
        type="button"
        variant="secondary"
        className="mt-5"
        onClick={onClear}
      >
        Clear filters
      </Button>
    </div>
  );
}

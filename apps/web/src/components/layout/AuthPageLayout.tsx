import type { ReactNode } from "react";

export function AuthPageLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white p-8 shadow-md ring-1 ring-slate-900/[0.05]">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          ApplyNest
        </p>
        <h1 className="mt-2.5 text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {description}
        </p>
        {children}
        {footer}
      </div>
    </div>
  );
}

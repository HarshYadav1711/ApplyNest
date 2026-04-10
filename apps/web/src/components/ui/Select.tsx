import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none",
        "focus:border-slate-300 focus:shadow focus:ring-2 focus:ring-slate-900/10",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none",
        className
      )}
      {...props}
    />
  );
}

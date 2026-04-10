import type { SelectHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none",
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
      {...props}
    />
  );
}

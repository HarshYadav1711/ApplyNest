import type { InputHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Input({
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none",
        "placeholder:text-slate-400",
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10",
        "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
      {...props}
    />
  );
}

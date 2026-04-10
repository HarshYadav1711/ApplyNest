import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 ${className}`}
      {...props}
    />
  );
}

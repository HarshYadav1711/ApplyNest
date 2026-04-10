import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Variant = "danger" | "warning" | "neutral";

const styles: Record<Variant, string> = {
  danger: "border-red-200 bg-red-50 text-red-900",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  neutral: "border-slate-200 bg-slate-50 text-slate-800",
};

export function Alert({
  children,
  variant = "danger",
  className,
  role = "alert",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  role?: "alert" | "status";
}) {
  const classNameMerged = cn(
    "rounded-lg border px-3 py-2.5 text-sm leading-snug",
    styles[variant],
    className
  );

  if (role === "status") {
    return (
      <div role="status" className={classNameMerged}>
        {children}
      </div>
    );
  }

  return (
    <div role="alert" className={classNameMerged}>
      {children}
    </div>
  );
}

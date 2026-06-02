import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "admin"
  | "neutral"
  | "count"
  | "primary";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  neutral: "bg-slate-100 text-slate-500",
  count: "bg-border/60 text-muted",
  primary: "bg-primary/10 text-primary",
};

interface BadgeProps {
  variant?: BadgeVariant;
  rounded?: "md" | "full";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", rounded = "md", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold",
        rounded === "full" ? "rounded-full px-2.5 py-1" : "rounded px-2 py-0.5",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

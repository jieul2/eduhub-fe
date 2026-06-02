import { cn } from "@/lib/utils";

interface SectionCardProps {
  icon?: React.ReactNode;
  iconBg?: string;
  title?: string;
  badge?: string | number;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  overflow?: "hidden" | "visible";
}

export function SectionCard({
  icon,
  iconBg,
  title,
  badge,
  headerRight,
  children,
  className,
  overflow = "hidden",
}: SectionCardProps) {
  const hasHeader = icon || title || badge != null || headerRight;

  return (
    <div
      className={cn(
        "bg-paper rounded-xl border border-border shadow-sm",
        overflow === "hidden" && "overflow-hidden",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          {icon && iconBg && (
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl shrink-0", iconBg)}>
              {icon}
            </div>
          )}
          {icon && !iconBg && (
            <span className="text-primary shrink-0">{icon}</span>
          )}
          {title && <span className="font-semibold text-ink text-sm">{title}</span>}
          {badge != null && (
            <span className="text-xs font-medium text-muted bg-border/60 px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {headerRight && <div className="ml-auto">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

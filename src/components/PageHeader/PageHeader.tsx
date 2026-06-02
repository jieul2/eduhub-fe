import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backLink?: { href: string; label: string };
}

export function PageHeader({
  label = "Admin",
  title,
  description,
  actions,
  backLink,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col gap-3 border-b border-border pb-6">
      {backLink && (
        <Link
          href={backLink.href}
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLink.label}
        </Link>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">{label}</span>
          <h1 className="text-3xl font-bold text-ink tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </section>
  );
}

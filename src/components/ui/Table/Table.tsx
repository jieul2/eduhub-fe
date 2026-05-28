import { cn } from "@/lib/utils";

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={cn("w-full text-sm", className)}>{children}</table>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="text-xs text-muted uppercase bg-border/20">{children}</tr>
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

type TableRowVariant = "default" | "warning" | "danger";

const ROW_VARIANT: Record<TableRowVariant, string> = {
  default: "",
  warning: "bg-amber-50/30",
  danger: "bg-red-50/40",
};

interface TableRowProps {
  children: React.ReactNode;
  variant?: TableRowVariant;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, variant = "default", onClick, className }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        "hover:bg-border/10 transition-colors group",
        onClick && "cursor-pointer",
        ROW_VARIANT[variant],
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface ThProps {
  children?: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function Th({ children, align = "left", className }: ThProps) {
  return (
    <th className={cn("px-5 py-3 font-semibold", `text-${align}`, className)}>{children}</th>
  );
}

interface TdProps {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
  title?: string;
}

export function Td({ children, className, colSpan, title }: TdProps) {
  return (
    <td colSpan={colSpan} title={title} className={cn("px-5 py-3", className)}>
      {children}
    </td>
  );
}

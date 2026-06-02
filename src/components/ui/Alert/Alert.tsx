import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "error" | "success" | "warning" | "info";

const ALERT_CLASSES: Record<AlertVariant, { container: string; icon: string }> = {
  error: { container: "bg-red-50 border-red-200 text-red-700", icon: "text-red-400 hover:text-red-600" },
  success: { container: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: "text-emerald-400 hover:text-emerald-600" },
  warning: { container: "bg-amber-50 border-amber-200 text-amber-700", icon: "text-amber-400 hover:text-amber-600" },
  info: { container: "bg-blue-50 border-blue-200 text-blue-700", icon: "text-blue-400 hover:text-blue-600" },
};

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = "error", children, onClose, className }: AlertProps) {
  const { container, icon } = ALERT_CLASSES[variant];
  return (
    <div className={cn("flex items-center gap-3 p-4 border rounded-xl text-sm", container, className)}>
      <span className="flex-1">{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} className={cn("shrink-0 transition-colors", icon)}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

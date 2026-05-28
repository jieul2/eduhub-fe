"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: string;
}

export function Dropdown({ trigger, items, align = "right", width = "w-52" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setIsOpen((v) => !v)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-1 bg-background border border-border rounded-xl shadow-lg z-10 overflow-hidden",
            width,
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-3 text-sm transition-colors",
                i < items.length - 1 && "border-b border-border",
                item.variant === "danger"
                  ? "text-danger hover:bg-red-50"
                  : "text-ink hover:bg-border/40",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

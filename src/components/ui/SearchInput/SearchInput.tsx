"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  width?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "검색",
  width = "w-44",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", width, className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
      <input
        className="w-full pl-8 pr-3 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

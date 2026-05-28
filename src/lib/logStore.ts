export type LogLevel = 'info' | 'success' | 'error' | 'warn';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  method: string;
  url: string;
  status?: number;
  duration?: number;
}

const MAX_ENTRIES = 300;
const entries: LogEntry[] = [];
const listeners = new Set<() => void>();

export const logStore = {
  add(entry: Omit<LogEntry, 'id'>) {
    const newEntry: LogEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    };
    entries.unshift(newEntry);
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
    listeners.forEach((fn) => fn());
  },

  getAll(): readonly LogEntry[] {
    return entries;
  },

  clear() {
    entries.length = 0;
    listeners.forEach((fn) => fn());
  },

  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

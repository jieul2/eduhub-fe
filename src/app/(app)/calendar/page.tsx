"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
  Calendar,
  X,
  Pencil,
  Trash2,
  Clock,
  Tag,
  AlignLeft,
  Settings,
  EyeOff,
} from "lucide-react";
import { useStore } from "../../../store";
import { CalendarEvent, CalendarEventForm } from "../../../features/calendar/calendar.types";
import Button from "../../../components/ui/Button/Button";

// ─── 내부 타입 ───────────────────────────────────────────────────────────────
interface ManagedCategory {
  id: string;
  name: string;
  color: string; // hex #rrggbb
  isDefault: boolean;
  enabled: boolean;
}

interface EventBar {
  event: CalendarEvent;
  colStart: number; // 0-6
  colSpan: number; // >=1
  lane: number;
  isStart: boolean; // 이벤트의 시작일 (이전 주에서 넘어온 게 아님)
  isEnd: boolean; // 이벤트의 종료일 (다음 주로 이어지지 않음)
}

// ─── 상수 ────────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: ManagedCategory[] = [
  { id: "def-수업", name: "수업", color: "#2563eb", isDefault: true, enabled: true },
  { id: "def-시험", name: "시험", color: "#ef4444", isDefault: true, enabled: true },
  { id: "def-상담", name: "상담", color: "#f59e0b", isDefault: true, enabled: true },
  { id: "def-행사", name: "행사", color: "#06b6d4", isDefault: true, enabled: true },
];

const COLOR_PRESETS = [
  "#2563eb", "#4f46e5", "#7c3aed", "#9333ea", "#c026d3",
  "#db2777", "#e11d48", "#dc2626", "#ea580c", "#ca8a04",
  "#16a34a", "#059669", "#0d9488", "#0891b2", "#0284c7",
  "#64748b",
];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const STORAGE_KEY = "eduhub-calendar-categories";

// 캘린더 레이아웃 상수
const DATE_ROW_H = 36;  // 날짜 숫자 영역 높이 (px)
const BAR_H = 20;       // 이벤트 바 높이 (px)
const BAR_GAP = 3;      // 바 간격 (px)
const MAX_LANES = 3;    // 최대 표시 레인 수
const ROW_BOTTOM = 8;   // 주 행 하단 여백

// ─── 유틸 ────────────────────────────────────────────────────────────────────
function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateTimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function formatDisplayTime(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatDisplayDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getCategoryColor(name: string, categories: ManagedCategory[]): string {
  return categories.find(c => c.name === name)?.color ?? "#94a3b8";
}

// ─── localStorage ────────────────────────────────────────────────────────────
function isValidCategories(data: unknown): data is ManagedCategory[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    data.every(
      (item: unknown) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ManagedCategory).id === "string" &&
        typeof (item as ManagedCategory).name === "string" &&
        (item as ManagedCategory).name.length > 0 &&
        typeof (item as ManagedCategory).color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test((item as ManagedCategory).color) &&
        typeof (item as ManagedCategory).enabled === "boolean",
    )
  );
}

function loadCategories(): ManagedCategory[] {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_CATEGORIES;
    const parsed: unknown = JSON.parse(stored);
    if (!isValidCategories(parsed)) return DEFAULT_CATEGORIES;
    return parsed;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

function saveCategories(cats: ManagedCategory[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

// ─── 캘린더 주 계산 ──────────────────────────────────────────────────────────
function getCalendarWeeks(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const flat: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) flat.push(null);
  for (let d = 1; d <= daysInMonth; d++) flat.push(new Date(year, month, d));
  while (flat.length % 7 !== 0) flat.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));
  return weeks;
}

// ─── 주별 이벤트 바 계산 (멀티데이 바 알고리즘) ─────────────────────────────
function computeWeekBars(
  week: (Date | null)[],
  events: CalendarEvent[],
  disabledCats: Set<string>,
): { visible: EventBar[]; hiddenCounts: Record<string, number> } {
  const validDays = week.filter(Boolean) as Date[];
  if (validDays.length === 0) return { visible: [], hiddenCounts: {} };

  const weekStartKey = toDateKey(validDays[0]);
  const weekEndKey = toDateKey(validDays[validDays.length - 1]);

  // 이번 주와 겹치는 이벤트 (비활성 카테고리 제외)
  const overlapping = events.filter(ev => {
    if (disabledCats.has(ev.category)) return false;
    const es = toDateKey(new Date(ev.start));
    const ee = toDateKey(new Date(ev.end));
    return es <= weekEndKey && ee >= weekStartKey;
  });

  // 시작일 기준 정렬, 같으면 긴 일정 먼저
  overlapping.sort((a, b) => {
    const as = new Date(a.start).getTime();
    const bs = new Date(b.start).getTime();
    if (as !== bs) return as - bs;
    return (new Date(b.end).getTime() - bs) - (new Date(a.end).getTime() - as);
  });

  type RawBar = Omit<EventBar, "lane">;
  const rawBars: RawBar[] = [];

  for (const ev of overlapping) {
    const evStart = toDateKey(new Date(ev.start));
    const evEnd = toDateKey(new Date(ev.end));

    // colStart: 이벤트가 이번 주 이전에 시작했으면 0열
    let colStart = 0;
    if (evStart >= weekStartKey) {
      const idx = week.findIndex(d => d !== null && toDateKey(d) === evStart);
      if (idx === -1) continue;
      colStart = idx;
    }

    // colEnd: 이번 주에서 이벤트가 있는 가장 오른쪽 열
    let colEnd = -1;
    for (let c = 6; c >= 0; c--) {
      const d = week[c];
      if (!d) continue;
      if (toDateKey(d) <= evEnd) { colEnd = c; break; }
    }
    if (colEnd === -1 || colEnd < colStart) continue;

    rawBars.push({
      event: ev,
      colStart,
      colSpan: colEnd - colStart + 1,
      isStart: evStart >= weekStartKey,
      isEnd: evEnd <= weekEndKey,
    });
  }

  // 인터벌 스케줄링으로 레인 배정
  const laneEnds: number[] = [];
  const barsWithLane: EventBar[] = rawBars.map(rb => {
    let lane = laneEnds.findIndex(end => end < rb.colStart);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = rb.colStart + rb.colSpan - 1;
    return { ...rb, lane };
  });

  const visible = barsWithLane.filter(b => b.lane < MAX_LANES);

  // 숨겨진 바 개수 (날짜별)
  const hiddenCounts: Record<string, number> = {};
  barsWithLane.filter(b => b.lane >= MAX_LANES).forEach(b => {
    for (let c = b.colStart; c < b.colStart + b.colSpan; c++) {
      const d = week[c];
      if (d) hiddenCounts[toDateKey(d)] = (hiddenCounts[toDateKey(d)] ?? 0) + 1;
    }
  });

  return { visible, hiddenCounts };
}

// ─── 색상 피커 ───────────────────────────────────────────────────────────────
function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [input, setInput] = useState(value);

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map(preset => (
          <button
            key={preset}
            type="button"
            onClick={() => { onChange(preset); setInput(preset); }}
            className={`size-6 rounded-full transition-all hover:scale-110 ${
              value === preset ? "ring-2 ring-offset-1 ring-ink/40 scale-110" : ""
            }`}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={input}
          onChange={e => { setInput(e.target.value); onChange(e.target.value); }}
          className="h-7 w-10 cursor-pointer rounded border border-border bg-transparent"
        />
        <input
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value);
          }}
          placeholder="#2563eb"
          maxLength={7}
          className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 font-mono text-xs text-ink focus:border-primary/50 focus:outline-none"
        />
        <span className="size-6 flex-shrink-0 rounded-full border border-border/50" style={{ backgroundColor: value }} />
      </div>
    </div>
  );
}

// ─── 카테고리 관리 패널 ───────────────────────────────────────────────────────
interface CategoryManagePanelProps {
  categories: ManagedCategory[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (name: string, color: string) => void;
  onClose: () => void;
}

function CategoryManagePanel({ categories, onToggle, onDelete, onAdd, onClose }: CategoryManagePanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#7c3aed");
  const [addError, setAddError] = useState<string | null>(null);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) { setAddError("이름을 입력해주세요."); return; }
    if (categories.some(c => c.name === name)) { setAddError("이미 존재하는 카테고리입니다."); return; }
    onAdd(name, newColor);
    setNewName(""); setNewColor("#7c3aed"); setShowAddForm(false); setAddError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-ink/20" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-paper shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-border px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Tag className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-ink">카테고리 관리</h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50">
            <X className="size-4" />
          </button>
        </div>

        {/* 카테고리 목록 */}
        <div className="max-h-72 overflow-y-auto space-y-1 px-6 py-3">
          {categories.map(cat => (
            <div key={cat.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-background">
              <span className="size-3.5 flex-shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className={`flex-1 text-sm font-semibold ${cat.enabled ? "text-ink" : "text-muted line-through"}`}>
                {cat.name}
              </span>
              {cat.isDefault && (
                <span className="rounded-full bg-border/60 px-2 py-0.5 text-[10px] font-bold text-muted">기본</span>
              )}
              {/* 토글 스위치 */}
              <button
                type="button"
                onClick={() => onToggle(cat.id)}
                title={cat.enabled ? "숨기기" : "표시하기"}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
                  cat.enabled ? "bg-primary" : "bg-border"
                }`}
              >
                <span className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${
                  cat.enabled ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </button>
              {/* 삭제 (커스텀만) */}
              {!cat.isDefault && (
                <button type="button" onClick={() => onDelete(cat.id)}
                  className="flex size-6 items-center justify-center rounded-lg text-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mx-6 border-t border-border" />

        {/* 새 카테고리 추가 */}
        <div className="px-6 py-4">
          {!showAddForm ? (
            <button type="button" onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-semibold text-muted transition-colors hover:border-primary/50 hover:text-primary">
              <Plus className="size-4" />
              새 카테고리 추가
            </button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">카테고리 이름</label>
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setAddError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                  placeholder="예: 특강, 행정, 회의..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-muted transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink">색상</label>
                <ColorPicker value={newColor} onChange={setNewColor} />
              </div>
              {addError && <p className="text-xs font-medium text-red-500">{addError}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button"
                  onClick={() => { setShowAddForm(false); setNewName(""); setAddError(null); }}
                  className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold text-muted transition-colors hover:bg-border/40">
                  취소
                </button>
                <button type="button" onClick={handleAdd}
                  className="flex-1 rounded-xl bg-primary py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
                  추가
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 이벤트 추가/수정 모달 ───────────────────────────────────────────────────
interface EventModalProps {
  mode: "create" | "edit";
  initialData: CalendarEventForm;
  categories: ManagedCategory[];
  onSubmit: (form: CalendarEventForm) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

function EventModal({ mode, initialData, categories, onSubmit, onClose, isSubmitting }: EventModalProps) {
  const [form, setForm] = useState<CalendarEventForm>(initialData);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError("제목을 입력해주세요."); return; }
    if (!form.start) { setFormError("시작 일시를 입력해주세요."); return; }
    if (!form.end) { setFormError("종료 일시를 입력해주세요."); return; }
    if (new Date(form.end) < new Date(form.start)) { setFormError("종료 일시는 시작 일시 이후여야 합니다."); return; }
    await onSubmit(form);
  };

  const enabledCategories = categories.filter(c => c.enabled);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-ink/20" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-paper shadow-2xl">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-paper px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-ink">
              {mode === "create" ? "일정 추가" : "일정 수정"}
            </h2>
          </div>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* 제목 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">제목 <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="일정 제목을 입력하세요"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* 시작 / 종료 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">시작 일시 <span className="text-red-400">*</span></label>
              <input type="datetime-local" name="start" value={form.start} onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">종료 일시 <span className="text-red-400">*</span></label>
              <input type="datetime-local" name="end" value={form.end} onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">카테고리</label>
            {enabledCategories.length === 0 ? (
              <p className="text-xs text-muted">활성화된 카테고리가 없습니다. 카테고리 관리에서 추가해주세요.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {enabledCategories.map(cat => {
                  const isSelected = form.category === cat.name;
                  return (
                    <button key={cat.id} type="button"
                      onClick={() => setForm(prev => ({ ...prev, category: cat.name }))}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                        isSelected ? "scale-105 shadow-sm border-current" : "border-border bg-background text-muted hover:border-current"
                      }`}
                      style={isSelected ? {
                        backgroundColor: hexToRgba(cat.color, 0.12),
                        color: cat.color,
                        borderColor: cat.color,
                      } : {}}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">설명</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={3} placeholder="일정에 대한 설명을 입력하세요 (선택)"
              className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink placeholder:text-muted transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {formError && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-500">{formError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="lg" onClick={onClose} className="flex-1">취소</Button>
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "저장 중..." : mode === "create" ? "일정 추가" : "수정 완료"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── 이벤트 상세 패널 ─────────────────────────────────────────────────────────
interface EventDetailPanelProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  categories: ManagedCategory[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

function EventDetailPanel({ events, selectedDate, categories, onEdit, onDelete }: EventDetailPanelProps) {
  const dateKey = selectedDate ? toDateKey(selectedDate) : null;
  const dayEvents = dateKey
    ? events.filter(e => {
        const s = toDateKey(new Date(e.start));
        const end = toDateKey(new Date(e.end));
        return s <= dateKey && dateKey <= end;
      })
    : [];

  return (
    <div className="flex min-h-[340px] flex-col overflow-hidden rounded-3xl border border-border bg-paper shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-background px-5 py-4">
        <Calendar className="size-4 text-primary" />
        <span className="text-sm font-bold text-ink">
          {selectedDate
            ? selectedDate.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })
            : "날짜를 선택하세요"}
        </span>
        {dayEvents.length > 0 && (
          <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {dayEvents.length}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!selectedDate && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-border/50">
              <Calendar className="size-6 text-muted" />
            </div>
            <p className="text-sm font-medium text-muted">캘린더에서 날짜를 클릭하세요</p>
          </div>
        )}
        {selectedDate && dayEvents.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-border/50">
              <Plus className="size-6 text-muted" />
            </div>
            <p className="text-sm font-medium text-muted">이 날 등록된 일정이 없습니다</p>
          </div>
        )}
        {dayEvents.map(event => {
          const color = getCategoryColor(event.category, categories);
          return (
            <div key={event._id}
              className="group rounded-xl border border-border bg-background p-4 transition-all hover:shadow-sm"
              style={{ borderLeftWidth: 3, borderLeftColor: color }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{ backgroundColor: hexToRgba(color, 0.12), color }}>
                      {event.category}
                    </span>
                  </div>
                  <p className="truncate text-sm font-bold text-ink">{event.title}</p>
                  {(event.start || event.end) && (
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                      <Clock className="size-3 shrink-0" />
                      <span>{formatDisplayTime(event.start)}</span>
                      <span>–</span>
                      <span>{formatDisplayTime(event.end)}</span>
                    </div>
                  )}
                  {event.description && (
                    <div className="mt-1.5 flex items-start gap-1 text-xs text-muted">
                      <AlignLeft className="mt-0.5 size-3 shrink-0" />
                      <span className="line-clamp-2">{event.description}</span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => onEdit(event)}
                    className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                    <Pencil className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => onDelete(event._id)}
                    className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 주별 행 컴포넌트 ─────────────────────────────────────────────────────────
interface WeekRowProps {
  week: (Date | null)[];
  bars: EventBar[];
  hiddenCounts: Record<string, number>;
  todayKey: string;
  selectedKey: string | null;
  categories: ManagedCategory[];
  currentMonth: number;
  onDayClick: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

function WeekRow({
  week, bars, hiddenCounts, todayKey, selectedKey,
  categories, currentMonth, onDayClick, onEventClick,
}: WeekRowProps) {
  const maxLane = bars.length > 0 ? Math.max(...bars.map(b => b.lane)) : -1;
  const visibleLanes = Math.min(maxLane + 1, MAX_LANES);
  const hasHidden = Object.values(hiddenCounts).some(c => c > 0);
  const eventsAreaH = visibleLanes * (BAR_H + BAR_GAP) + (hasHidden ? 18 : 0) + ROW_BOTTOM;
  const totalH = DATE_ROW_H + Math.max(eventsAreaH, 10);

  return (
    <div className="relative border-b border-border/50" style={{ height: totalH }}>

      {/* Layer 1: 클릭 가능한 배경 셀 */}
      <div className="absolute inset-0 grid grid-cols-7">
        {week.map((day, col) => {
          if (!day) return (
            <div key={`empty-${col}`} className="h-full border-r border-border/50 bg-background/40" />
          );
          const key = toDateKey(day);
          const isSelected = key === selectedKey;
          const isOtherMonth = day.getMonth() !== currentMonth;
          return (
            <div key={key}
              onClick={() => onDayClick(day)}
              className={`h-full cursor-pointer border-r border-border/50 transition-colors ${
                isSelected ? "bg-primary/5" : "hover:bg-background/70"
              } ${isOtherMonth ? "opacity-40" : ""}`}
            />
          );
        })}
      </div>

      {/* Layer 2: 이벤트 바 영역 */}
      <div className="pointer-events-none absolute inset-x-0" style={{ top: DATE_ROW_H, bottom: 0 }}>
        {bars.map(bar => {
          const color = getCategoryColor(bar.event.category, categories);
          const leftPct = `${(bar.colStart / 7) * 100}%`;
          const widthPct = `${(bar.colSpan / 7) * 100}%`;
          const top = bar.lane * (BAR_H + BAR_GAP) + 2;
          const ml = bar.isStart ? 2 : 0;
          const mr = bar.isEnd ? 2 : 0;
          const borderRadius = `${bar.isStart ? 4 : 0}px ${bar.isEnd ? 4 : 0}px ${bar.isEnd ? 4 : 0}px ${bar.isStart ? 4 : 0}px`;

          return (
            <div
              key={`${bar.event._id}-${bar.colStart}`}
              className="pointer-events-auto absolute cursor-pointer"
              style={{ left: leftPct, width: widthPct, top, height: BAR_H, paddingLeft: ml, paddingRight: mr }}
              onClick={e => { e.stopPropagation(); onEventClick(bar.event); }}
              title={bar.event.title}
            >
              <div
                className="flex h-full w-full select-none items-center overflow-hidden whitespace-nowrap"
                style={{
                  backgroundColor: hexToRgba(color, 0.15),
                  color,
                  borderLeft: bar.isStart ? `3px solid ${color}` : "none",
                  paddingLeft: bar.isStart ? 6 : 4,
                  paddingRight: 4,
                  borderRadius,
                }}
              >
                <span className="truncate text-[10px] font-semibold leading-none">
                  {bar.isStart ? bar.event.title : ""}
                </span>
              </div>
            </div>
          );
        })}

        {/* "+N개 더" 인디케이터 */}
        {week.map((day, col) => {
          if (!day) return null;
          const key = toDateKey(day);
          const hidden = hiddenCounts[key];
          if (!hidden) return null;
          const top = MAX_LANES * (BAR_H + BAR_GAP) + 4;
          return (
            <div key={`more-${key}`}
              className="pointer-events-none absolute flex items-center"
              style={{ left: `${(col / 7) * 100}%`, width: `${(1 / 7) * 100}%`, top, height: 14, paddingLeft: 4 }}>
              <span className="text-[9px] font-bold text-muted">+{hidden}</span>
            </div>
          );
        })}
      </div>

      {/* Layer 3: 날짜 숫자 (최상단, pointer-events-none) */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 grid grid-cols-7"
        style={{ height: DATE_ROW_H }}
      >
        {week.map((day, col) => {
          if (!day) return <div key={`empty-num-${col}`} className="border-r border-border/50" />;
          const key = toDateKey(day);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const isSunday = day.getDay() === 0;
          const isSaturday = day.getDay() === 6;
          const isOtherMonth = day.getMonth() !== currentMonth;
          return (
            <div key={`num-${key}`}
              className={`flex items-start justify-end border-r border-border/50 p-1.5 ${isOtherMonth ? "opacity-40" : ""}`}>
              <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                isToday ? "bg-primary text-white"
                : isSelected ? "bg-primary/20 text-primary"
                : isSunday ? "text-red-400"
                : isSaturday ? "text-primary"
                : "text-ink"
              }`}>
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCategoryManage, setShowCategoryManage] = useState(false);

  // 카테고리 상태 (localStorage 동기화)
  // SSR hydration 불일치 방지: 초기값은 DEFAULT_CATEGORIES, 마운트 후 localStorage에서 로드
  const [categories, setCategories] = useState<ManagedCategory[]>(DEFAULT_CATEGORIES);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  useEffect(() => {
    if (!categoriesLoaded) {
      setCategories(loadCategories());
      setCategoriesLoaded(true);
    }
  }, [categoriesLoaded]);
  useEffect(() => {
    if (categoriesLoaded) saveCategories(categories);
  }, [categories, categoriesLoaded]);

  const disabledCats = useMemo(
    () => new Set(categories.filter(c => !c.enabled).map(c => c.name)),
    [categories],
  );

  const { events, isCalendarLoading, calendarError, fetchEvents, createEvent, updateEvent, deleteEvent } =
    useStore();

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── 월 이동
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentYear(y => y - 1); setCurrentMonth(11); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentYear(y => y + 1); setCurrentMonth(0); }
    else setCurrentMonth(m => m + 1);
  };
  const goToday = () => {
    setCurrentYear(today.getFullYear()); setCurrentMonth(today.getMonth()); setSelectedDate(today);
  };

  // ── 캘린더 주 / 이벤트 바
  const weeks = useMemo(() => getCalendarWeeks(currentYear, currentMonth), [currentYear, currentMonth]);
  const weekBarData = useMemo(
    () => weeks.map(week => computeWeekBars(week, events, disabledCats)),
    [weeks, events, disabledCats],
  );

  // ── 모달 핸들러
  const [initialForm, setInitialForm] = useState<CalendarEventForm>({
    title: "",
    start: `${toDateKey(today)}T09:00`,
    end: `${toDateKey(today)}T10:00`,
    category: "수업",
    description: "",
  });

  const openCreateModal = () => {
    const base = selectedDate ? toDateKey(selectedDate) : toDateKey(today);
    const firstEnabled = categories.find(c => c.enabled)?.name ?? "수업";
    setEditingEvent(null);
    setModalMode("create");
    setSubmitError(null);
    setInitialForm({ title: "", start: `${base}T09:00`, end: `${base}T10:00`, category: firstEnabled, description: "" });
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setModalMode("edit");
    setSubmitError(null);
    setInitialForm({
      title: event.title,
      start: formatDateTimeLocal(event.start),
      end: formatDateTimeLocal(event.end),
      category: event.category,
      description: event.description,
    });
  };

  const closeModal = () => { setModalMode(null); setEditingEvent(null); setSubmitError(null); };

  const handleSubmit = async (form: CalendarEventForm) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      if (modalMode === "create") await createEvent(form);
      else if (modalMode === "edit" && editingEvent) await updateEvent(editingEvent._id, form);
      closeModal();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("이 일정을 삭제하시겠습니까?")) return;
    try { await deleteEvent(eventId); }
    catch (err) { alert(err instanceof Error ? err.message : "삭제에 실패했습니다."); }
  };

  const handleEventBarClick = (event: CalendarEvent) => {
    const d = new Date(event.start);
    setSelectedDate(d);
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
  };

  // ── 카테고리 관리
  const toggleCategory = (id: string) =>
    setCategories(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  const deleteCategory = (id: string) =>
    setCategories(prev => prev.filter(c => c.id !== id));
  const addCategory = (name: string, color: string) =>
    setCategories(prev => [...prev, { id: `custom-${Date.now()}`, name, color, isDefault: false, enabled: true }]);

  const todayKey = toDateKey(today);
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const visibleEventCount = events.filter(e => !disabledCats.has(e.category)).length;

  return (
    <div className="mt-5 w-full max-w-[1400px] mx-auto space-y-6 p-5 md:p-8">
      {/* ── 페이지 헤더 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-muted">
            {today.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">일정 관리</h1>
          <p className="mt-1 text-sm text-muted">학원 일정을 월별로 관리하고 확인하세요.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="default" variant="outline" onClick={() => setShowCategoryManage(true)}>
            <Settings className="size-4" />
            카테고리 관리
          </Button>
          <Button size="lg" variant="primary" onClick={openCreateModal}>
            <Plus className="size-4" />
            일정 추가
          </Button>
        </div>
      </div>

      {/* ── 안내 배너 */}
      <section className="flex items-start gap-4 rounded-2xl border-l-[3px] border-primary bg-surface-container-low p-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Info className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink">일정 관리 안내</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            날짜를 클릭하면 해당 날의 일정을 오른쪽 패널에서 확인할 수 있습니다.
            연속된 일정은 이어지는 바로 표시됩니다.
            카테고리 배지를 클릭해 표시 여부를 바로 토글할 수 있으며,{" "}
            <span className="font-semibold text-ink">카테고리 관리</span>에서 원하는 색상의 카테고리를 추가할 수 있습니다.
          </p>
        </div>
      </section>

      {/* ── 카테고리 범례 (클릭으로 토글) */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
            title={cat.enabled ? "클릭해서 숨기기" : "클릭해서 표시"}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
              cat.enabled ? "border-current" : "border-border opacity-50 grayscale"
            }`}
            style={cat.enabled ? {
              backgroundColor: hexToRgba(cat.color, 0.1),
              color: cat.color,
              borderColor: cat.color,
            } : {}}
          >
            <span className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
            {cat.name}
            {!cat.enabled && <EyeOff className="ml-0.5 size-3" />}
          </button>
        ))}
        <div className="ml-auto text-xs text-muted">
          총 <span className="font-bold text-primary">{visibleEventCount}</span>개 일정
        </div>
      </div>

      {/* ── 에러 */}
      {(calendarError || submitError) && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-500">
          {calendarError || submitError}
        </div>
      )}

      {/* ── 메인: 캘린더 + 상세 패널 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* 캘린더 그리드 */}
        <div className="overflow-hidden rounded-3xl border border-border bg-paper shadow-sm">
          {/* 월 이동 컨트롤 */}
          <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
            <button type="button" onClick={prevMonth}
              className="flex size-9 items-center justify-center rounded-xl text-ink transition-colors hover:bg-border/50">
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-ink">
                {currentYear}년 <span className="text-primary">{String(currentMonth + 1).padStart(2, "0")}월</span>
              </h2>
              <button type="button" onClick={goToday}
                className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/20">
                오늘
              </button>
            </div>
            <button type="button" onClick={nextMonth}
              className="flex size-9 items-center justify-center rounded-xl text-ink transition-colors hover:bg-border/50">
              <ChevronRight className="size-5" />
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((day, i) => (
              <div key={day} className={`py-2.5 text-center text-xs font-bold tracking-wide ${
                i === 0 ? "text-red-400" : i === 6 ? "text-primary" : "text-muted"
              }`}>{day}</div>
            ))}
          </div>

          {/* 주별 행 */}
          {isCalendarLoading ? (
            <div className="flex items-center justify-center py-20 text-sm font-medium text-muted">
              <div className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                불러오는 중...
              </div>
            </div>
          ) : (
            weeks.map((week, wi) => {
              const { visible, hiddenCounts } = weekBarData[wi];
              return (
                <WeekRow
                  key={wi}
                  week={week}
                  bars={visible}
                  hiddenCounts={hiddenCounts}
                  todayKey={todayKey}
                  selectedKey={selectedKey}
                  categories={categories}
                  currentMonth={currentMonth}
                  onDayClick={setSelectedDate}
                  onEventClick={handleEventBarClick}
                />
              );
            })
          )}
        </div>

        {/* 날짜 상세 패널 */}
        <EventDetailPanel
          events={events}
          selectedDate={selectedDate}
          categories={categories}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

      {/* ── 이번 달 전체 일정 목록 */}
      {(() => {
        const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
        const monthEvents = events
          .filter(e => e.start.startsWith(monthKey) && !disabledCats.has(e.category))
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        if (monthEvents.length === 0) return null;
        return (
          <div className="overflow-hidden rounded-3xl border border-border bg-paper shadow-sm">
            <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
              <Tag className="size-4 text-primary" />
              <h3 className="text-sm font-bold text-ink">
                {currentYear}년 {currentMonth + 1}월 전체 일정
              </h3>
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                {monthEvents.length}
              </span>
            </div>
            <div className="divide-y divide-border">
              {monthEvents.map(event => {
                const color = getCategoryColor(event.category, categories);
                return (
                  <div key={event._id}
                    className="group flex cursor-pointer items-start gap-4 px-6 py-4 transition-colors hover:bg-background/60"
                    style={{ borderLeft: `3px solid ${color}` }}
                    onClick={() => {
                      const d = new Date(event.start);
                      setSelectedDate(d); setCurrentYear(d.getFullYear()); setCurrentMonth(d.getMonth());
                    }}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                      <span className="text-xs font-extrabold text-ink">{new Date(event.start).getDate()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ backgroundColor: hexToRgba(color, 0.12), color }}>
                          {event.category}
                        </span>
                        <span className="text-xs text-muted">{formatDisplayDate(event.start)}</span>
                      </div>
                      <p className="truncate text-sm font-bold text-ink">{event.title}</p>
                      {event.description && (
                        <p className="mt-0.5 truncate text-xs text-muted">{event.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button type="button" onClick={e => { e.stopPropagation(); openEditModal(event); }}
                        className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-primary/10 hover:text-primary">
                        <Pencil className="size-3.5" />
                      </button>
                      <button type="button" onClick={e => { e.stopPropagation(); handleDelete(event._id); }}
                        className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-500">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── 모달 */}
      {modalMode && (
        <EventModal
          mode={modalMode}
          initialData={initialForm}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={closeModal}
          isSubmitting={isSubmitting}
        />
      )}
      {showCategoryManage && (
        <CategoryManagePanel
          categories={categories}
          onToggle={toggleCategory}
          onDelete={deleteCategory}
          onAdd={addCategory}
          onClose={() => setShowCategoryManage(false)}
        />
      )}
    </div>
  );
}

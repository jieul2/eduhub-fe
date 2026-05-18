"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CreditCard, CheckCircle2, Search, X } from "lucide-react";
import api from "../../../../lib/axiosInstance";
import { Student } from "../../../../features/student/student.types";
import Button from "../../../../components/ui/Button/Button";

type PaymentStatus = "pending" | "completed" | "failed";

type FormData = {
  studentId: string;
  amount: string;
  status: PaymentStatus;
};

type FormErrors = Partial<Record<"studentId" | "amount", string>>;

const statusOptions: { value: PaymentStatus; label: string; activeVariant: "accent" | "primary" | "danger" }[] = [
  { value: "pending",   label: "미납",     activeVariant: "accent"  },
  { value: "completed", label: "결제완료", activeVariant: "primary" },
  { value: "failed",    label: "결제실패", activeVariant: "danger"  },
];

const formatDisplay = (raw: string) =>
  raw ? Number(raw.replace(/[^0-9]/g, "")).toLocaleString("ko-KR") : "";

const PaymentNewPage = () => {
  const router = useRouter();

  const emptyForm: FormData = { studentId: "", amount: "", status: "pending" };

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successId, setSuccessId] = useState("");

  /* 학생 검색 */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /* 디바운스 학생 검색 */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get("/students", { params: { name: searchQuery, limit: 8 } });
        const list = Array.isArray(res.data.students) ? res.data.students : [];
        setSearchResults(list);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* 외부 클릭 시 드롭다운 닫기 */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectStudent = (student: Student) => {
    setSelectedStudent(student);
    setForm((prev) => ({ ...prev, studentId: student._id }));
    setSearchQuery(student.username);
    setShowDropdown(false);
    if (errors.studentId) setErrors((prev) => ({ ...prev, studentId: undefined }));
  };

  const clearStudent = () => {
    setSelectedStudent(null);
    setForm((prev) => ({ ...prev, studentId: "" }));
    setSearchQuery("");
    setSearchResults([]);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.studentId) next.studentId = "학생을 선택해주세요.";
    const num = Number(form.amount);
    if (!form.amount) next.amount = "금액을 입력해주세요.";
    else if (Number.isNaN(num) || num <= 0) next.amount = "유효한 금액을 입력해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      setSubmitError(null);
      const res = await api.post("/payments", {
        studentId: form.studentId,
        amount: Number(form.amount),
        status: form.status,
      });
      setSuccessId(res.data.payment?._id ?? "");
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "결제 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ───── 성공 화면 ───── */
  if (success) {
    const statusLabel = statusOptions.find((s) => s.value === form.status)?.label ?? "";
    return (
      <div className="mx-auto mt-10 max-w-md px-4 sm:px-6">
        <div className="rounded-3xl bg-background p-8 text-center shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-ink">결제 등록 완료</h2>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-ink">{selectedStudent?.username}</span> 학생의
            결제가 성공적으로 등록됐습니다.
          </p>

          <div className="mt-6 rounded-3xl bg-paper p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">등록 내역</p>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">학생</span>
                <span className="font-semibold text-ink">{selectedStudent?.username}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted">금액</span>
                <span className="font-semibold text-ink">{formatDisplay(form.amount)}원</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-muted">상태</span>
                <span className="font-semibold text-ink">{statusLabel}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              type="button"
              variant="outline"
              radius="pill"
              isFullWidth
              onClick={() => {
                setSuccess(false);
                setForm(emptyForm);
                setSelectedStudent(null);
                setSearchQuery("");
                setErrors({});
              }}
            >
              계속 등록하기
            </Button>
            {successId && (
              <Button
                type="button"
                variant="outline"
                radius="pill"
                isFullWidth
                onClick={() => router.push(`/payments/${successId}`)}
              >
                상세 보기
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              radius="pill"
              isFullWidth
              onClick={() => router.push("/payments")}
            >
              목록으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ───── 등록 폼 ───── */
  return (
    <div className="mx-auto mt-6 max-w-xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/payments")}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          결제 목록으로 돌아가기
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">결제 등록</h1>
        <p className="mt-2 text-sm text-muted">
          학생을 선택하고 결제 금액과 상태를 입력하여 새 결제를 등록합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="rounded-3xl bg-background p-8 sm:p-10 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.10)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">결제 정보</h2>
              <p className="mt-1 text-sm text-muted">결제할 학생과 금액, 상태를 입력합니다.</p>
            </div>
          </div>

          <div className="mt-8 space-y-7">
            {/* 학생 선택 */}
            <div>
              <label className="block text-sm font-semibold text-ink">
                학생 <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-3" ref={searchRef}>
                <div
                  className={`flex items-center gap-2 rounded-full border px-4 transition focus-within:ring-2 ${
                    errors.studentId
                      ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                      : "border-border focus-within:border-primary focus-within:ring-primary/10"
                  }`}
                >
                  <Search className="h-4 w-4 shrink-0 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      if (selectedStudent) clearStudent();
                      setSearchQuery(e.target.value);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    placeholder="이름으로 학생 검색"
                    className="flex-1 bg-transparent py-4 text-[15px] text-ink placeholder:text-muted outline-none"
                  />
                  {selectedStudent ? (
                    <button
                      type="button"
                      onClick={clearStudent}
                      className="shrink-0 text-muted transition hover:text-ink"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : isSearching ? (
                    <svg className="h-4 w-4 shrink-0 animate-spin text-muted" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : null}
                </div>

                {/* 드롭다운 */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full rounded-3xl border border-border bg-background py-2 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)]">
                    {searchResults.map((student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => selectStudent(student)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-paper"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {student.username.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-ink">{student.username}</p>
                          <p className="truncate text-xs text-muted">{student.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 검색 결과 없음 */}
                {showDropdown && !isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="absolute z-10 mt-2 w-full rounded-3xl border border-border bg-background px-5 py-4 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)]">
                    <p className="text-sm text-muted">일치하는 학생이 없습니다.</p>
                  </div>
                )}
              </div>
              {errors.studentId && (
                <p className="mt-1.5 text-xs text-red-500">{errors.studentId}</p>
              )}
            </div>

            {/* 금액 */}
            <div>
              <label className="block text-sm font-semibold text-ink">
                결제 금액 <span className="text-red-400">*</span>
              </label>
              <div
                className={`mt-3 flex items-center rounded-full border transition focus-within:ring-2 ${
                  errors.amount
                    ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
                    : "border-border focus-within:border-primary focus-within:ring-primary/10"
                }`}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.amount ? Number(form.amount).toLocaleString("ko-KR") : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setForm((prev) => ({ ...prev, amount: raw }));
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                    if (submitError) setSubmitError(null);
                  }}
                  placeholder="0"
                  className="flex-1 bg-transparent px-6 py-4 text-right text-[15px] text-ink placeholder:text-muted outline-none"
                />
                <span className="px-6 text-[15px] font-semibold text-muted">원</span>
              </div>
              {errors.amount && <p className="mt-1.5 text-xs text-red-500">{errors.amount}</p>}
            </div>

            {/* 결제 상태 */}
            <div>
              <label className="block text-sm font-semibold text-ink">결제 상태</label>
              <div className="mt-3 flex gap-2">
                {statusOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    radius="pill"
                    size="lg"
                    variant={form.status === opt.value ? opt.activeVariant : "outline"}
                    className="flex-1"
                    onClick={() => setForm((prev) => ({ ...prev, status: opt.value }))}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 서버 에러 */}
        {submitError && (
          <div className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            radius="pill"
            size="xl"
            isFullWidth
            onClick={() => router.push("/payments")}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            radius="pill"
            size="lg"
            isFullWidth
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            {isLoading ? "등록 중…" : "결제 등록"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentNewPage;

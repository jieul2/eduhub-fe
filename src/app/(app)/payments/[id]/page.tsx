"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarRange, CircleAlert, User, X } from "lucide-react";
import api from "../../../../lib/axiosInstance";
import { Payment, PaymentDetailResponse } from "../../../../features/payment/payment.types";
import Button from "../../../../components/ui/Button/Button";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);

const STATUS_CONFIG: Record<Payment["status"], { label: string; className: string; dot: string }> = {
  completed: { label: "결제완료", className: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  failed: { label: "결제실패", className: "bg-red-100 text-red-700", dot: "bg-red-500" },
  pending: { label: "미납", className: "bg-amber-100 text-amber-700", dot: "bg-amber-400" },
};

const PaymentDetailPage = () => {
  const params = useParams<{ id: string }>();
  const paymentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Payment["status"] | null>(null);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError("결제 ID가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }
    const fetchPaymentDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get<PaymentDetailResponse>(`/payments/${paymentId}`);
        setPayment(response.data.payment);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "결제 상세 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentDetail();
  }, [paymentId]);

  const handleStatusChange = async () => {
    if (!pendingStatus || !payment || pendingStatus === payment.status || !paymentId) return;
    try {
      setIsStatusUpdating(true);
      setStatusUpdateError(null);
      await api.put(`/payments/${paymentId}/status`, { status: pendingStatus });
      setPayment((prev) => prev ? { ...prev, status: pendingStatus, updatedAt: new Date().toISOString() } : prev);
      setIsStatusModalOpen(false);
      setPendingStatus(null);
    } catch (err) {
      setStatusUpdateError(err instanceof Error ? err.message : "상태 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const openStatusModal = () => {
    setPendingStatus(null);
    setStatusUpdateError(null);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    if (isStatusUpdating) return;
    setIsStatusModalOpen(false);
    setPendingStatus(null);
    setStatusUpdateError(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-border/40" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 rounded-xl bg-border/40" />
            <div className="h-64 rounded-xl bg-border/40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <CircleAlert className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink">결제 정보를 불러오지 못했습니다</h1>
          <p className="mt-2 text-sm text-muted">{error ?? "잠시 후 다시 시도해 주세요."}</p>
          <Link
            href="/payments"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            결제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
  const studentName = payment.user?.username ?? "학생 정보 없음";
  const hasStudentId = Boolean(payment.studentId);

  const summaryItems = [
    { label: "결제 상태", value: cfg.label, description: "현재 결제 처리 상태입니다." },
    { label: "결제 금액", value: formatAmount(payment.amount), description: "청구된 결제 금액입니다." },
    { label: "생성일", value: formatDate(payment.createdAt), description: "결제 건 생성 일시입니다." },
  ];

  return (
    <>
      <div className="flex flex-col gap-6 pb-12 max-w-7xl mx-auto w-full p-6">
        {/* Header */}
        <section className="flex flex-col gap-3 border-b border-border pb-6">
          <Link href="/payments" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors w-fit">
            <ArrowLeft className="h-4 w-4" />
            결제 목록으로 돌아가기
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">결제 상세</span>
              <h1 className="text-3xl font-bold text-ink tracking-tight">결제 상세</h1>
              <p className="text-sm text-muted">결제 건의 금액, 상태, 생성/수정 이력을 한 화면에서 확인합니다.</p>
            </div>
            <button
              type="button"
              onClick={openStatusModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-ink text-sm font-medium hover:bg-border/40 transition-colors self-start"
            >
              상태 변경
            </button>
          </div>
        </section>

        {/* Main + Summary */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <article className="rounded-xl border border-border bg-paper p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-muted mb-1">결제 금액</p>
            <p className="text-3xl font-bold text-ink mb-1">{formatAmount(payment.amount)}</p>
            <p className="text-xs text-muted font-mono mb-6">ID: {payment._id}</p>

            <div className="grid gap-3 sm:grid-cols-2 mb-6">
              <div className="flex items-center gap-3 rounded-xl bg-border/20 px-4 py-3 text-sm">
                <User className="h-4 w-4 text-primary" />
                {hasStudentId ? (
                  <Link href={`/students/${payment.studentId}`} className="text-muted hover:text-primary hover:underline transition-colors">
                    {studentName}
                  </Link>
                ) : (
                  <span className="text-muted">{studentName}</span>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-border/20 px-4 py-3 text-sm">
                <CalendarRange className="h-4 w-4 text-primary" />
                <span className="text-muted">생성일 {formatDate(payment.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-border/20 px-4 py-3 text-sm sm:col-span-2">
                <CalendarRange className="h-4 w-4 text-primary" />
                <span className="text-muted">수정일 {formatDate(payment.updatedAt)}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "결제 상태", value: cfg.label },
                { label: "결제 금액", value: formatAmount(payment.amount) },
                { label: "학생명", value: studentName },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-border/20 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-ink">{item.value}</p>
                </div>
              ))}
            </div>
          </article>

          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {summaryItems.map((item) => (
              <article key={item.label} className="rounded-xl border border-border bg-paper p-5 shadow-sm">
                <p className="text-xs text-muted font-medium uppercase tracking-wider">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-ink">{item.value}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{item.description}</p>
              </article>
            ))}
          </aside>
        </section>
      </div>

      {/* 상태 변경 모달 */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={closeStatusModal} />
          <div className="relative z-10 w-[520px] overflow-hidden rounded-2xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper">
                  <AlertTriangle className="h-4 w-4 text-muted" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">결제 상태 변경</p>
                  <p className="text-xs text-muted">변경 후 되돌리려면 다시 수정해야 합니다</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeStatusModal}
                disabled={isStatusUpdating}
                className="rounded-lg p-1.5 text-muted transition hover:bg-paper hover:text-ink disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">상태 선택</p>
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-3">
                {([
                  { value: "pending" as const, label: "미납", sub: "결제 대기 중", dot: "bg-amber-400" },
                  { value: "completed" as const, label: "결제완료", sub: "정상 결제됨", dot: "bg-emerald-500" },
                  { value: "failed" as const, label: "결제실패", sub: "결제 처리 실패", dot: "bg-red-500" },
                ]).map((opt) => {
                  const isCurrent = payment.status === opt.value;
                  const isSelected = pendingStatus === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isCurrent || isStatusUpdating}
                      onClick={() => setPendingStatus(opt.value)}
                      className={`flex w-full items-center gap-4 rounded-xl border px-5 py-4 text-left transition ${
                        isCurrent
                          ? "cursor-not-allowed border-border bg-paper opacity-50"
                          : isSelected
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-background text-ink hover:bg-paper"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${opt.dot}`} />
                      <span className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold leading-snug">{opt.label}</span>
                        <span className="text-xs leading-snug text-muted">{opt.sub}</span>
                      </span>
                      <span className={`ml-auto shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        isCurrent ? "bg-border text-muted" : isSelected ? "bg-primary/10 font-semibold text-primary" : "invisible"
                      }`}>
                        {isCurrent ? "현재" : "선택됨"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {pendingStatus && pendingStatus !== payment.status && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper px-4 py-3">
                  <span className="text-sm font-medium text-muted">{STATUS_CONFIG[payment.status].label}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className="text-sm font-semibold text-ink">{STATUS_CONFIG[pendingStatus].label}</span>
                  <span className="ml-auto text-xs text-muted">으로 변경됩니다</span>
                </div>
              )}

              {statusUpdateError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {statusUpdateError}
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-border px-6 py-4">
              <Button type="button" variant="outline" radius="xl" size="lg" isFullWidth disabled={isStatusUpdating} onClick={closeStatusModal}>
                취소
              </Button>
              <Button
                type="button"
                variant="primary"
                radius="xl"
                size="lg"
                isFullWidth
                disabled={!pendingStatus || pendingStatus === payment.status || isStatusUpdating}
                onClick={handleStatusChange}
              >
                {isStatusUpdating ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    변경 중…
                  </>
                ) : "변경 확인"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentDetailPage;

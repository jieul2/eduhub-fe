"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CalendarRange, CircleAlert, User, X } from "lucide-react";
import api from "../../../../lib/axiosInstance";
import { Payment, PaymentDetailResponse } from "../../../../features/payment/payment.types";
import Button from "../../../../components/ui/Button/Button";

const formatDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("ko-KR").format(amount);
};

const getStatusLabel = (status: Payment["status"]) => {
  if (status === "completed") {
    return "결제완료";
  }

  if (status === "failed") {
    return "결제실패";
  }

  return "미납";
};

const getStatusClassName = (status: Payment["status"]) => {
  if (status === "completed") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
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
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else {
          setError("결제 상세 정보를 불러오지 못했습니다.");
        }
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
      setPayment((prev) =>
        prev ? { ...prev, status: pendingStatus, updatedAt: new Date().toISOString() } : prev,
      );
      setIsStatusModalOpen(false);
      setPendingStatus(null);
    } catch (err) {
      setStatusUpdateError(
        err instanceof Error ? err.message : "상태 변경에 실패했습니다. 다시 시도해주세요.",
      );
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
      <div className="mx-auto mt-5 max-w-7xl p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-56 rounded-lg bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="h-72 rounded-3xl bg-slate-200" />
            <div className="h-72 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="mx-auto mt-5 max-w-3xl p-8">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <CircleAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">결제 정보를 불러오지 못했습니다</h1>
          <p className="mt-2 text-sm text-slate-600">{error ?? "잠시 후 다시 시도해 주세요."}</p>
          <Link
            href="/payments"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            결제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const summaryItems = [
    {
      label: "결제 상태",
      value: getStatusLabel(payment.status),
      description: "현재 결제 처리 상태입니다.",
    },
    {
      label: "결제 금액",
      value: `${formatAmount(payment.amount)}원`,
      description: "청구된 결제 금액입니다.",
    },
    {
      label: "생성일",
      value: formatDate(payment.createdAt),
      description: "결제 건 생성 일시입니다.",
    },
  ];

  const studentName = payment.user?.username ?? "학생 정보 없음";
  const hasStudentId = Boolean(payment.studentId);

  return (
    <div className="mx-auto mt-5 max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/payments"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            결제 목록으로 돌아가기
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">결제 상세</h1>
          <p className="mt-2 text-sm text-slate-500">
            결제 건의 금액, 상태, 생성/수정 이력을 한 화면에서 확인합니다.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          radius="pill"
          size="lg"
          onClick={openStatusModal}
        >
          상태 변경
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
        <article className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
            <div className="space-y-4">

              <div>
                <p className="text-sm font-medium text-slate-500">결제 프로필</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{formatAmount(payment.amount)}원</h2>
                <p className="mt-2 text-sm text-slate-500">결제 ID {payment._id}</p>
              </div>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClassName(payment.status)}`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {getStatusLabel(payment.status)}
              </div>
            </div>

            <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm shadow-sm sm:grid-cols-2 lg:p-5">
              <div className="rounded-2xl bg-white/90 p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3 text-slate-700">
                  <User className="h-4 w-4 text-blue-600" />
                  {hasStudentId ? (
                    <Link
                      href={`/students/${payment.studentId}`}
                      className="font-medium text-slate-900 transition hover:underline"
                    >
                     {studentName}
                    </Link>
                  ) : (
                    <span>학생명 {studentName}</span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white/90 p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-3 text-slate-700">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span>생성일 {formatDate(payment.createdAt)}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/90 p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)] sm:col-span-2">
                <div className="flex items-center gap-3 text-slate-700">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span>수정일 {formatDate(payment.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">결제 상태</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{getStatusLabel(payment.status)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)]">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">결제 금액</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatAmount(payment.amount)}원</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] sm:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">학생명</p>
              {hasStudentId ? (
                <Link
                  href={`/students/${payment.studentId}`}
                  className="mt-2 inline-block text-lg font-semibold text-slate-900 transition hover:underline"
                >
                  {studentName}
                </Link>
              ) : (
                <p className="mt-2 text-lg font-semibold text-slate-900">{studentName}</p>
              )}
            </div>
          </div>
        </article>

        <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {summaryItems.map((item) => (
            <article
              key={item.label}
              className="rounded-3xl bg-white p-5 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.35)]"
            >
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-extrabold text-slate-900 xl:text-3xl">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </aside>
      </section>

      {/* 상태 변경 모달 */}
      {isStatusModalOpen && payment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={closeStatusModal}
          />

          {/* 모달 */}
          <div className="relative z-10 w-130 overflow-hidden rounded-2xl bg-background shadow-2xl">

            {/* 헤더 */}
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

            {/* 본문 */}
            <div className="px-6 py-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">상태 선택</p>
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3">
                {([
                  { value: "pending"   as const, label: "미납",     sub: "결제 대기 중",   dot: "bg-amber-400"   },
                  { value: "completed" as const, label: "결제완료", sub: "정상 결제됨",    dot: "bg-emerald-500" },
                  { value: "failed"    as const, label: "결제실패", sub: "결제 처리 실패", dot: "bg-rose-500"    },
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
                        isCurrent
                          ? "bg-border text-muted"
                          : isSelected
                          ? "bg-primary/10 font-semibold text-primary"
                          : "invisible"
                      }`}>
                        {isCurrent ? "현재" : "선택됨"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 변경 요약 */}
              {pendingStatus && pendingStatus !== payment.status && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-paper px-4 py-3">
                  <span className="text-sm font-medium text-muted">{getStatusLabel(payment.status)}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className="text-sm font-semibold text-ink">{getStatusLabel(pendingStatus)}</span>
                  <span className="ml-auto text-xs text-muted">으로 변경됩니다</span>
                </div>
              )}

              {/* 에러 */}
              {statusUpdateError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {statusUpdateError}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex gap-2 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                radius="xl"
                size="lg"
                isFullWidth
                disabled={isStatusUpdating}
                onClick={closeStatusModal}
              >
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
                ) : (
                  "변경 확인"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailPage;

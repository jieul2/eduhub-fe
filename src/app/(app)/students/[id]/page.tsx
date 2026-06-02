"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck2,
  CalendarRange,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";
import api from "../../../../lib/axiosInstance";
import {
  StudentAchievement,
  StudentAttendance,
  StudentClassItem,
  StudentCounsel,
  StudentDetailResponse,
  StudentParentLink,
  StudentPayment,
} from "../../../../features/student/student.types";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { Alert } from "@/components/ui/Alert/Alert";
import { Badge } from "@/components/ui/Badge/Badge";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(date);
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(date);
};

const getStatusLabel = (status?: string) => (status === "active" ? "활성" : "비활성");

const getGenderLabel = (gender?: string) => {
  if (gender === "male") return "남성";
  if (gender === "female") return "여성";
  return "-";
};

const getConsultationTypeLabel = (type: StudentCounsel["consultation_type"]) =>
  type === "parent" ? "학부모 상담" : "학생 상담";

const getPaymentStatusConfig = (status: StudentPayment["status"]) => {
  const map = {
    completed: { label: "결제 완료", badgeVariant: "success" as const },
    pending: { label: "결제 대기", badgeVariant: "warning" as const },
    failed: { label: "결제 실패", badgeVariant: "danger" as const },
  };
  return map[status] ?? map.pending;
};

const getAttendanceStatusConfig = (status: StudentAttendance["status"]) => {
  const map = {
    present: { label: "출석", badgeVariant: "success" as const },
    absent: { label: "결석", badgeVariant: "danger" as const },
    late: { label: "지각", badgeVariant: "warning" as const },
  };
  return map[status] ?? map.present;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);

const EmptyState = ({ message }: { message: string }) => (
  <p className="rounded-xl bg-border/20 p-5 text-sm text-muted text-center">{message}</p>
);

const StudentDetailPage = () => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const studentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [data, setData] = useState<StudentDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setError("학생 ID가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }
    let isActive = true;
    setData(null);
    setError(null);
    setIsLoading(true);

    const fetchStudentDetail = async () => {
      try {
        const response = await api.get<StudentDetailResponse>(`/students/${studentId}`);
        if (isActive) setData(response.data);
      } catch (fetchError) {
        if (isActive)
          setError(fetchError instanceof Error ? fetchError.message : "학생 상세 정보를 불러오지 못했습니다.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    fetchStudentDetail();
    return () => { isActive = false; };
  }, [studentId]);

  const averageScore = useMemo(() => {
    if (!data?.achievements.length) return null;
    return Math.round((data.achievements.reduce((s, a) => s + a.score, 0) / data.achievements.length) * 10) / 10;
  }, [data?.achievements]);

  const totalPaymentAmount = useMemo(() => {
    if (!data?.payments.length) return 0;
    return data.payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  }, [data?.payments]);

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

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl p-6 flex flex-col gap-4">
        <Alert variant="error">{error ?? "잠시 후 다시 시도해 주세요."}</Alert>
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          학생 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const { student, achievements, classes, counsels, payments, attendances, parents } = data;

  const summaryItems = [
    {
      label: "성적 기록",
      value: `${achievements.length}건`,
      description: averageScore === null ? "등록된 점수가 없습니다." : `평균 점수 ${averageScore}점`,
    },
    {
      label: "수강 수업",
      value: `${classes.length}개`,
      description: classes.length ? "현재 연결된 수업 정보입니다." : "배정된 수업이 없습니다.",
    },
    {
      label: "상담 이력",
      value: `${counsels.length}건`,
      description: counsels.length ? "최근 상담부터 확인할 수 있습니다." : "상담 이력이 없습니다.",
    },
    {
      label: "결제 완료",
      value: formatAmount(totalPaymentAmount),
      description: payments.length ? `총 ${payments.length}건의 결제 내역` : "결제 내역이 없습니다.",
    },
  ];

  return (
    <div className="flex flex-col gap-6 pb-12 max-w-7xl mx-auto w-full p-6">
      <PageHeader
        label="학생 상세"
        title={`${student.username} 학생`}
        description="기본 정보와 성적, 수업, 상담, 결제, 출석 현황을 확인합니다."
        backLink={{ href: "/students", label: "학생 목록으로 돌아가기" }}
        actions={
          <Badge
            variant={student.status === "active" ? "success" : "neutral"}
            rounded="full"
          >
            {getStatusLabel(student.status)}
          </Badge>
        }
      />

      {/* Profile + Summary */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <article className="rounded-xl border border-border bg-paper p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">학생 프로필</p>
          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {[
              { icon: <Mail className="h-4 w-4 text-primary" />, value: student.email },
              { icon: <Phone className="h-4 w-4 text-primary" />, value: student.phone || "등록된 연락처 없음" },
              { icon: <CalendarRange className="h-4 w-4 text-primary" />, value: `생년월일 ${formatDate(student.birthDate)}` },
              { icon: <User className="h-4 w-4 text-primary" />, value: `${getGenderLabel(student.gender)} · ${student.role}` },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-border/20 px-4 py-3 text-sm text-ink">
                {item.icon}
                <span className="text-muted">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "성별", value: getGenderLabel(student.gender) },
              { label: "계정 상태", value: getStatusLabel(student.status) },
              { label: "최근 수정", value: formatDate(student.updatedAt) },
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

      {/* Detail Cards */}
      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          icon={<BookOpen className="h-5 w-5 text-blue-700" />}
          iconBg="bg-blue-100"
          title="성적 현황"
        >
          <div className="p-6 space-y-3">
            {achievements.length ? achievements.map((a: StudentAchievement) => (
              <div key={a._id} className="rounded-xl border border-border bg-border/10 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink text-sm">{a.subjectId?.title || "과목 정보 없음"}</p>
                    <p className="mt-1 text-xs text-muted">등록일 {formatDate(a.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">{a.score}점</span>
                </div>
              </div>
            )) : <EmptyState message="등록된 성적 기록이 없습니다." />}
          </div>
        </SectionCard>

        <SectionCard
          icon={<CalendarRange className="h-5 w-5 text-emerald-700" />}
          iconBg="bg-emerald-100"
          title="수강 수업"
        >
          <div className="p-6 space-y-3">
            {classes.length ? classes.map((c: StudentClassItem) => (
              <div key={c._id} className="rounded-xl border border-border bg-border/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink text-sm">{c.subjectId?.title || "수업명 정보 없음"}</p>
                  <Badge variant="success">{getStatusLabel(c.status)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted">담당 강사 {c.instructorId?.username || "미정"}</p>
                {c.classroomId?.classroomName && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <MapPin className="h-3 w-3" />{c.classroomId.classroomName}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted">{formatDateTime(c.startTime)} ~ {formatDateTime(c.endTime)}</p>
              </div>
            )) : <EmptyState message="현재 배정된 수업이 없습니다." />}
          </div>
        </SectionCard>

        <SectionCard
          icon={<Users className="h-5 w-5 text-amber-700" />}
          iconBg="bg-amber-100"
          title="상담 이력"
        >
          <div className="p-6 space-y-3">
            {counsels.length ? counsels.map((c: StudentCounsel) => (
              <div key={c._id} className="rounded-xl border border-border bg-border/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink text-sm">{getConsultationTypeLabel(c.consultation_type)}</p>
                  <p className="text-xs text-muted">{formatDate(c.start)}</p>
                </div>
                {c.instructorId?.username && <p className="mt-1 text-xs text-muted">담당 강사: {c.instructorId.username}</p>}
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
                <p className="mt-2 text-xs text-muted">상담 시간 {formatDateTime(c.start)} ~ {formatDateTime(c.end)}</p>
              </div>
            )) : <EmptyState message="등록된 상담 이력이 없습니다." />}
          </div>
        </SectionCard>

        <SectionCard
          icon={<CreditCard className="h-5 w-5 text-violet-700" />}
          iconBg="bg-violet-100"
          title="결제 내역"
        >
          <div className="p-6 space-y-3">
            {payments.length ? payments.map((p: StudentPayment) => {
              const cfg = getPaymentStatusConfig(p.status);
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => router.push(`/payments/${p._id}`)}
                  className="w-full rounded-xl border border-border bg-border/10 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink text-sm">{formatAmount(p.amount)}</p>
                    <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">{formatDate(p.createdAt)}</p>
                </button>
              );
            }) : <EmptyState message="결제 내역이 없습니다." />}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          icon={<CalendarCheck2 className="h-5 w-5 text-sky-700" />}
          iconBg="bg-sky-100"
          title="출석 현황"
        >
          <div className="p-6 space-y-3">
            {attendances.length ? attendances.map((a: StudentAttendance) => {
              const cfg = getAttendanceStatusConfig(a.status);
              return (
                <div key={a._id} className="rounded-xl border border-border bg-border/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink text-sm">{formatDate(a.date)}</p>
                    <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                  </div>
                  {a.reason && <p className="mt-1 text-xs text-muted">사유: {a.reason}</p>}
                </div>
              );
            }) : <EmptyState message="출석 이력이 없습니다." />}
          </div>
        </SectionCard>

        <SectionCard
          icon={<Users className="h-5 w-5 text-rose-700" />}
          iconBg="bg-rose-100"
          title="학부모 정보"
        >
          <div className="p-6 space-y-3">
            {parents.length ? parents.map((link: StudentParentLink) =>
              link.parentId ? (
                <div key={link._id} className="rounded-xl border border-border bg-border/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-ink text-sm">{link.parentId.username}</p>
                      <p className="text-xs text-muted">{link.parentId.email}</p>
                    </div>
                  </div>
                  {link.parentId.phone && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                      <Phone className="h-3 w-3" />
                      {link.parentId.phone}
                    </div>
                  )}
                </div>
              ) : null
            ) : <EmptyState message="연결된 학부모가 없습니다." />}
          </div>
        </SectionCard>
      </section>
    </div>
  );
};

export default StudentDetailPage;

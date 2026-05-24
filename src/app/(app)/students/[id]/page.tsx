"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	BookOpen,
	CalendarCheck2,
	CalendarRange,
	CircleAlert,
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
import PaymentDetailModal from "./PaymentDetailModal";

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

const formatDateTime = (value?: string) => {
	if (!value) {
		return "-";
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return "-";
	}

	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const getStatusLabel = (status?: string) => {
	return status === "active" ? "활성" : "비활성";
};

const getGenderLabel = (gender?: string) => {
	if (gender === "male") {
		return "남성";
	}

	if (gender === "female") {
		return "여성";
	}

	return "-";
};

const getConsultationTypeLabel = (type: StudentCounsel["consultation_type"]) =>
	type === "parent" ? "학부모 상담" : "학생 상담";

const getPaymentStatusConfig = (status: StudentPayment["status"]) => {
	const map = {
		completed: { label: "결제 완료", badge: "bg-emerald-100 text-emerald-700" },
		pending: { label: "결제 대기", badge: "bg-amber-100 text-amber-700" },
		failed: { label: "결제 실패", badge: "bg-red-100 text-red-700" },
	};
	return map[status] ?? map.pending;
};

const getAttendanceStatusConfig = (status: StudentAttendance["status"]) => {
	const map = {
		present: { label: "출석", badge: "bg-emerald-100 text-emerald-700" },
		absent: { label: "결석", badge: "bg-red-100 text-red-700" },
		late: { label: "지각", badge: "bg-amber-100 text-amber-700" },
	};
	return map[status] ?? map.present;
};

const formatAmount = (amount: number) =>
	new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);

const StudentDetailPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const studentId = Array.isArray(params?.id) ? params.id[0] : params?.id;

	const [data, setData] = useState<StudentDetailResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedPayment, setSelectedPayment] = useState<StudentPayment | null>(null);

	useEffect(() => {
		if (!studentId) {
			setError("학생 ID가 올바르지 않습니다.");
			setIsLoading(false);
			return;
		}

		let isActive = true;

		setData(null);
		setSelectedPayment(null);
		setError(null);
		setIsLoading(true);

		const fetchStudentDetail = async () => {
			try {
				const response = await api.get<StudentDetailResponse>(`/students/${studentId}`);
				if (!isActive) {
					return;
				}

				setData(response.data);
			} catch (fetchError) {
				if (!isActive) {
					return;
				}

				if (fetchError instanceof Error) {
					setError(fetchError.message);
				} else {
					setError("학생 상세 정보를 불러오지 못했습니다.");
				}
			} finally {
				if (!isActive) {
					return;
				}

				setIsLoading(false);
			}
		};

		fetchStudentDetail();

		return () => {
			isActive = false;
		};
	}, [studentId]);

	const averageScore = useMemo(() => {
		if (!data?.achievements.length) return null;
		const totalScore = data.achievements.reduce((sum, a) => sum + a.score, 0);
		return Math.round((totalScore / data.achievements.length) * 10) / 10;
	}, [data?.achievements]);

	const totalPaymentAmount = useMemo(() => {
		if (!data?.payments.length) return 0;
		return data.payments.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
	}, [data?.payments]);

	if (isLoading) {
		return (
			<div className="mx-auto mt-5 max-w-7xl p-8">
				<div className="animate-pulse space-y-6">
					<div className="h-10 w-56 rounded-lg bg-slate-200" />
					<div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
						<div className="h-72 rounded-3xl bg-slate-200" />
						<div className="h-72 rounded-3xl bg-slate-200" />
					</div>
					<div className="grid gap-6 xl:grid-cols-3">
						<div className="h-64 rounded-3xl bg-slate-200" />
						<div className="h-64 rounded-3xl bg-slate-200" />
						<div className="h-64 rounded-3xl bg-slate-200" />
					</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="mx-auto mt-5 max-w-3xl p-8">
				<div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
						<CircleAlert className="h-7 w-7" />
					</div>
					<h1 className="mt-4 text-2xl font-bold text-slate-900">학생 정보를 불러오지 못했습니다</h1>
					<p className="mt-2 text-sm text-slate-600">{error ?? "잠시 후 다시 시도해 주세요."}</p>
					<Link
						href="/students"
						className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						<ArrowLeft className="h-4 w-4" />
						학생 목록으로 돌아가기
					</Link>
				</div>
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
		<>
			{selectedPayment && (
				<PaymentDetailModal
					payment={selectedPayment}
					studentName={student.username}
					onClose={() => setSelectedPayment(null)}
				/>
			)}
			<div className="mx-auto mt-5 max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<Link
							href="/students"
							className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
						>
							<ArrowLeft className="h-4 w-4" />
							학생 목록으로 돌아가기
						</Link>
						<h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{student.username} 학생 상세</h1>
						<p className="mt-2 text-sm text-slate-500">
							학생 기본 정보와 성적, 수강 수업, 상담 이력, 결제 내역, 출석 현황을 한 화면에서 확인합니다.
						</p>
					</div>
				</div>

				<section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.9fr)]">
					<article className="rounded-[28px] bg-white p-6 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
						<div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-start">
							<div className="space-y-4">
								<div>
									<p className="text-sm font-medium text-slate-500">학생 프로필</p>
									<h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{student.username}</h2>
									<p className="mt-2 text-sm text-slate-500">
										등록일 {formatDate(student.createdAt)} · 계정 유형 {student.role}
									</p>
								</div>
								<div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 lg:hidden">
									{getStatusLabel(student.status)}
								</div>
							</div>
							<div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm shadow-sm sm:grid-cols-2 lg:p-5">
								<div className="rounded-2xl bg-white/90 p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)]">
									<div className="flex items-center gap-3 text-slate-700">
										<Mail className="h-4 w-4 text-blue-600" />
										<span className="break-all">{student.email}</span>
									</div>
								</div>
								<div className="rounded-2xl bg-white/90 p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)]">
									<div className="flex items-center gap-3 text-slate-700">
										<Phone className="h-4 w-4 text-blue-600" />
										<span>{student.phone || "등록된 연락처 없음"}</span>
									</div>
								</div>
								<div className="rounded-2xl bg-white/90 p-4 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.35)] sm:col-span-2">
									<div className="flex items-center gap-3 text-slate-700">
										<CalendarRange className="h-4 w-4 text-blue-600" />
										<span>생년월일 {formatDate(student.birthDate)}</span>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							<div className="rounded-3xl bg-slate-50 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)]">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">성별</p>
								<p className="mt-2 text-lg font-semibold text-slate-900">{getGenderLabel(student.gender)}</p>
							</div>
							<div className="rounded-3xl bg-slate-50 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)]">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">계정 상태</p>
								<p className="mt-2 text-lg font-semibold text-slate-900">{getStatusLabel(student.status)}</p>
							</div>
							<div className="rounded-3xl bg-slate-50 p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.4)] sm:col-span-2 xl:col-span-1">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-500">최근 수정</p>
								<p className="mt-2 text-lg font-semibold text-slate-900">{formatDate(student.updatedAt)}</p>
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

				<section className="grid gap-6 xl:grid-cols-2">
					<article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.5)]">
						<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
								<BookOpen className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">성적 현황</h2>
								<p className="text-sm text-slate-500">학생별 과목 성적 기록입니다.</p>
							</div>
						</div>

						<div className="mt-6 space-y-3">
							{achievements.length ? (
								achievements.map((achievement: StudentAchievement) => (
									<div key={achievement._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="font-semibold text-slate-900">
													{achievement.subjectId?.title || "과목 정보 없음"}
												</p>
												<p className="mt-1 text-sm text-slate-500">등록일 {formatDate(achievement.createdAt)}</p>
											</div>
											<div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
												{achievement.score}점
											</div>
										</div>
									</div>
								))
							) : (
								<p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">등록된 성적 기록이 없습니다.</p>
							)}
						</div>
					</article>

					<article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.5)]">
						<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
								<CalendarRange className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">수강 수업</h2>
								<p className="text-sm text-slate-500">학생이 등록된 수업 목록입니다.</p>
							</div>
						</div>

						<div className="mt-6 space-y-3">
							{classes.length ? (
								classes.map((classItem: StudentClassItem) => (
									<div key={classItem._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
										<div className="flex items-center justify-between gap-3">
											<p className="font-semibold text-slate-900">
												{classItem.subjectId?.title || "수업명 정보 없음"}
											</p>
											<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
												{getStatusLabel(classItem.status)}
											</span>
										</div>
										<p className="mt-2 text-sm text-slate-600">담당 강사 {classItem.instructorId?.username || "미정"}</p>
										{classItem.classroomId?.classroomName && (
											<p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
												<MapPin className="h-3.5 w-3.5" />
												{classItem.classroomId.classroomName}
											</p>
										)}
										<p className="mt-1 text-sm text-slate-500">
											{formatDateTime(classItem.startTime)} ~ {formatDateTime(classItem.endTime)}
										</p>
									</div>
								))
							) : (
								<p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">현재 배정된 수업이 없습니다.</p>
							)}
						</div>
					</article>

					<article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.5)]">
						<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
								<CircleAlert className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">상담 이력</h2>
								<p className="text-sm text-slate-500">최근 상담 순서로 정렬되어 있습니다.</p>
							</div>
						</div>

						<div className="mt-6 space-y-3">
							{counsels.length ? (
								counsels.map((counsel: StudentCounsel) => (
									<div key={counsel._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
										<div className="flex items-center justify-between gap-3">
											<p className="font-semibold text-slate-900">{getConsultationTypeLabel(counsel.consultation_type)}</p>
											<p className="text-xs font-medium text-slate-500">{formatDate(counsel.start)}</p>
										</div>
										{counsel.instructorId?.username && (
											<p className="mt-1 text-xs text-slate-500">담당 강사: {counsel.instructorId.username}</p>
										)}
										<p className="mt-2 text-sm leading-6 text-slate-600">{counsel.text}</p>
										<p className="mt-3 text-xs text-slate-500">
											상담 시간 {formatDateTime(counsel.start)} ~ {formatDateTime(counsel.end)}
										</p>
									</div>
								))
							) : (
								<p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">등록된 상담 이력이 없습니다.</p>
							)}
						</div>
					</article>

					<article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.5)]">
						<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
								<CreditCard className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">결제 내역</h2>
								<p className="text-sm text-slate-500">항목을 클릭하면 상세를 확인합니다.</p>
							</div>
						</div>
						<div className="mt-6 space-y-3">
							{payments.length ? (
								payments.map((payment: StudentPayment) => {
									const cfg = getPaymentStatusConfig(payment.status);
									return (
										<button
											key={payment._id}
											type="button"
										onClick={() => router.push(`/payments/${payment._id}`)}
											className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:border-violet-200 hover:bg-violet-50 hover:shadow-sm"
										>
											<div className="flex items-center justify-between gap-3">
												<p className="font-semibold text-slate-900">{formatAmount(payment.amount)}</p>
												<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>{cfg.label}</span>
											</div>
											<p className="mt-2 text-sm text-slate-500">{formatDate(payment.createdAt)}</p>
										</button>
									);
								})
							) : (
								<p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">결제 내역이 없습니다.</p>
							)}
						</div>
					</article>
				</section>

				<section className="grid gap-6 lg:grid-cols-2">
					<article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.5)]">
						<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
								<CalendarCheck2 className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">출석 현황</h2>
								<p className="text-sm text-slate-500">최근 출석 이력입니다.</p>
							</div>
						</div>
						<div className="mt-6 space-y-3">
							{attendances.length ? (
								attendances.map((att: StudentAttendance) => {
									const cfg = getAttendanceStatusConfig(att.status);
									return (
										<div key={att._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
											<div className="flex items-center justify-between gap-3">
												<p className="font-semibold text-slate-900">{formatDate(att.date)}</p>
												<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}>{cfg.label}</span>
											</div>
											{att.reason && <p className="mt-2 text-sm text-slate-500">사유: {att.reason}</p>}
										</div>
									);
								})
							) : (
								<p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">출석 이력이 없습니다.</p>
							)}
						</div>
					</article>

					<article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.5)]">
						<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
								<Users className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-xl font-bold text-slate-900">학부모 정보</h2>
								<p className="text-sm text-slate-500">연결된 학부모 목록입니다.</p>
							</div>
						</div>
						<div className="mt-6 space-y-3">
							{parents.length ? (
								parents.map((link: StudentParentLink) =>
									link.parentId ? (
										<div key={link._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
													<User className="h-4 w-4" />
												</div>
												<div>
													<p className="font-semibold text-slate-900">{link.parentId.username}</p>
													<p className="text-sm text-slate-500">{link.parentId.email}</p>
												</div>
											</div>
											{link.parentId.phone && (
												<div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
													<Phone className="h-3.5 w-3.5" />
													{link.parentId.phone}
												</div>
											)}
										</div>
									) : null,
								)
							) : (
								<p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">연결된 학부모가 없습니다.</p>
							)}
						</div>
					</article>
				</section>
			</div>
		</>
	);
};

export default StudentDetailPage;

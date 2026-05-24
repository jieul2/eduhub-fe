"use client";

import { X, CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react";
import { StudentPayment } from "../../../../features/student/student.types";

interface PaymentDetailModalProps {
	payment: StudentPayment;
	studentName: string;
	onClose: () => void;
}

const formatDate = (value?: string) => {
	if (!value) return "-";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "-";
	return new Intl.DateTimeFormat("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
};

const formatAmount = (amount: number) => {
	return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);
};

const STATUS_CONFIG = {
	completed: {
		label: "결제 완료",
		icon: CheckCircle2,
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		text: "text-emerald-700",
		iconColor: "text-emerald-500",
		badge: "bg-emerald-100 text-emerald-700",
	},
	pending: {
		label: "결제 대기",
		icon: Clock,
		bg: "bg-amber-50",
		border: "border-amber-200",
		text: "text-amber-700",
		iconColor: "text-amber-500",
		badge: "bg-amber-100 text-amber-700",
	},
	failed: {
		label: "결제 실패",
		icon: XCircle,
		bg: "bg-red-50",
		border: "border-red-200",
		text: "text-red-700",
		iconColor: "text-red-500",
		badge: "bg-red-100 text-red-700",
	},
} as const;

const PaymentDetailModal = ({ payment, studentName, onClose }: PaymentDetailModalProps) => {
	const config = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
	const StatusIcon = config.icon;

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
			onClick={handleBackdropClick}
		>
			<div className="w-full max-w-md rounded-[28px] bg-white shadow-2xl overflow-hidden">
				{/* 헤더 */}
				<div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
							<CreditCard className="h-5 w-5" />
						</div>
						<div>
							<h2 className="text-lg font-bold text-slate-900">결제 상세</h2>
							<p className="text-xs text-slate-500">{studentName} 학생</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* 결제 상태 배너 */}
				<div className={`mx-6 mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 ${config.bg} ${config.border}`}>
					<StatusIcon className={`h-5 w-5 shrink-0 ${config.iconColor}`} />
					<div>
						<p className={`text-sm font-semibold ${config.text}`}>{config.label}</p>
						<p className="text-xs text-slate-500">결제 ID: {payment._id}</p>
					</div>
					<span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${config.badge}`}>
						{config.label}
					</span>
				</div>

				{/* 결제 정보 */}
				<div className="px-6 py-5 space-y-4">
					<div className="rounded-2xl bg-slate-50 p-4 space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-500">결제 금액</span>
							<span className="text-xl font-extrabold text-slate-900">{formatAmount(payment.amount)}</span>
						</div>
						<div className="h-px bg-slate-200" />
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-500">결제 상태</span>
							<span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}>
								{config.label}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-500">결제 생성일</span>
							<span className="text-sm font-medium text-slate-700">{formatDate(payment.createdAt)}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-500">마지막 수정일</span>
							<span className="text-sm font-medium text-slate-700">{formatDate(payment.updatedAt)}</span>
						</div>
					</div>
				</div>

				{/* 닫기 버튼 */}
				<div className="px-6 pb-6">
					<button
						onClick={onClose}
						className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						닫기
					</button>
				</div>
			</div>
		</div>
	);
};

export default PaymentDetailModal;

"use client";

import { useRouter } from "next/navigation";
import { Payment } from "../../../../features/payment/payment.types";

const getPaymentStatusLabel = (status: Payment["status"]) => {
  if (status === "completed") {
    return "결제완료";
  }

  if (status === "failed") {
    return "결제실패";
  }

  return "미납";
};

const getPaymentStatusClassName = (status: Payment["status"]) => {
  if (status === "completed") {
    return "bg-green-100 text-green-800";
  }

  if (status === "failed") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("ko-KR").format(amount);
};

const formatDate = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
};

const PaymentsTable = ({ payments }: { payments: Payment[] }) => {
  const router = useRouter();

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_-10px_rgba(0,55,72,0.08)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 w-12">
                <input
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                  type="checkbox"
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                학생명
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                결제 금액
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                상태
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                생성일
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {payments.map((payment, index) => (
              <tr
                key={payment._id ?? index}
                className="hover:bg-slate-50/50 cursor-pointer"
                onClick={() => router.push(`/payments/${payment._id}`)}
              >
                <td className="px-6 py-4 w-12">
                  <input
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{payment.user?.username ?? "학생 정보 없음"}</td>
                <td className="px-6 py-4 text-slate-600">{formatAmount(payment.amount)}원</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusClassName(payment.status)}`}
                  >
                    {getPaymentStatusLabel(payment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTable;
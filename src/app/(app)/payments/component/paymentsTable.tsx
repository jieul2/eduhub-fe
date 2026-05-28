"use client";

import { useRouter } from "next/navigation";
import { Payment } from "../../../../features/payment/payment.types";

type StatusKey = Payment["status"];

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
  completed: { label: "결제완료", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "결제실패", className: "bg-red-100 text-red-700" },
  pending: { label: "미납", className: "bg-amber-100 text-amber-700" },
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
};

const PaymentsTable = ({ payments }: { payments: Payment[] }) => {
  const router = useRouter();

  return (
    <div className="bg-paper rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase bg-border/20">
              <th className="text-left px-5 py-3 font-semibold">학생명</th>
              <th className="text-left px-5 py-3 font-semibold">결제 금액</th>
              <th className="text-left px-5 py-3 font-semibold">상태</th>
              <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">생성일</th>
              <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">수정일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment, index) => {
              const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
              return (
                <tr
                  key={payment._id ?? index}
                  className="hover:bg-border/10 cursor-pointer transition-colors group"
                  onClick={() => router.push(`/payments/${payment._id}`)}
                >
                  <td className="px-5 py-3 font-medium text-ink group-hover:text-primary transition-colors">
                    {payment.user?.username ?? <span className="text-muted italic">학생 정보 없음</span>}
                  </td>
                  <td className="px-5 py-3 text-ink font-semibold">
                    {formatAmount(payment.amount)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted text-xs hidden sm:table-cell">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-muted text-xs hidden md:table-cell">
                    {formatDate(payment.updatedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTable;

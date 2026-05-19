"use client";

import type { Payment } from "../../../../types/payment.types";

const PaymentsTable = ({ payments }: { payments: Payment[] }) => {
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
                학생 이름
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                결제 금액
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                결제 상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {payments.map((payment, index) => (
              <tr key={index} className="hover:bg-slate-50/50 cursor-pointer">
                <td className="px-6 py-4 w-12">
                  <input
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    type="checkbox"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{payment.user?.username ?? "N/A"}</td>
                <td className="px-6 py-4 text-slate-600">{payment.amount}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payment.status === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {payment.status === "paid" ? "결제 완료" : "미결제"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsTable;

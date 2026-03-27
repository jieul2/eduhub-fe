"use client";



// users 임시 데이터, 백엔드 API 연동 시 제거 예정
interface users {
  username: string;
  role: string;
  status: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
}

interface Payment {
    user: users;
    amount: number;
    status: string;
}
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
                성명
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                금액
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                상태
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
                <td className="px-6 py-4 font-medium text-slate-900">{payment.user.username}</td>
                <td className="px-6 py-4 text-slate-600">{payment.amount}</td>
                <td className="px-6 py-4 text-slate-600">{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination 백엔드 구현 및 프론트엔드 연동 필요 (하드코딩) */}
      
    </div>
  );
};

export default PaymentsTable;

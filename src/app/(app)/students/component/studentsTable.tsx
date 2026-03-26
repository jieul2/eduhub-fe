"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";

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
const StudentsTable = ({ users }: { users: users[] }) => {
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
                생년월일
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                성별
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                휴대폰번호
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                이메일
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">
                상태
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-slate-50/50 cursor-pointer">
                <td className="px-6 py-4 w-12">
                  <input
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    type="checkbox"
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                <td className="px-6 py-4 text-slate-600">{user.birthDate}</td>
                <td className="px-6 py-4 text-slate-600">
                  {user.gender === "남" ||
                  user.gender === "남자" ||
                  user.gender === "male" ||
                  user.gender === "남성"
                    ? "남성"
                    : "여성"}
                </td>
                <td className="px-6 py-4 text-slate-600">{user.phone}</td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.status === "active" ? "활성" : "비활성"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination 백엔드 구현 및 프론트엔드 연동 필요 (하드코딩) */}
      <div className="px-6 py-4 flex items-center justify-between bg-slate-50/50">
        <div className="text-xs text-slate-500">Showing 1 to 10 of 10 results</div>
        <div className="flex gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-xs">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 text-xs">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentsTable;

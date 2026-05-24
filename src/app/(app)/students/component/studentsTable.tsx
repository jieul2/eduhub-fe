"use client";

import { useRouter } from "next/navigation";
import { Student } from "../../../../features/student/student.types";

const StudentsTable = ({ users }: { users: Student[] }) => {
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
              <tr
                key={user._id ?? index}
                className="hover:bg-slate-50/50 cursor-pointer"
                onClick={() => router.push(`/students/${user._id}`)}
              >
                <td className="px-6 py-4 w-12">
                  <input
                    className="rounded border-slate-300 text-primary focus:ring-primary"
                    type="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">{user.username}</td>
                <td className="px-6 py-4 text-slate-600">
                  {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : ""}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {user.gender === "male" ? "남성" : "여성"}
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
      
    </div>
  );
};

export default StudentsTable;

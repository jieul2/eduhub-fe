"use client";

import { useRouter } from "next/navigation";
import { User, Mail, Phone } from "lucide-react";
import { Student } from "../../../../features/student/student.types";

const StudentsTable = ({ users }: { users: Student[] }) => {
  const router = useRouter();

  return (
    <div className="bg-paper rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted uppercase bg-border/20">
              <th className="text-left px-5 py-3 font-semibold">성명</th>
              <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">생년월일</th>
              <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">성별</th>
              <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  연락처
                </div>
              </th>
              <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  이메일
                </div>
              </th>
              <th className="text-left px-5 py-3 font-semibold">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user, index) => (
              <tr
                key={user._id ?? index}
                className="hover:bg-border/10 cursor-pointer transition-colors group"
                onClick={() => router.push(`/students/${user._id}`)}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-border/40 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-muted" />
                    </div>
                    <span className="font-medium text-ink group-hover:text-primary transition-colors">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted text-xs hidden sm:table-cell">
                  {user.birthDate ? new Date(user.birthDate).toLocaleDateString("ko-KR") : "-"}
                </td>
                <td className="px-5 py-3 text-muted text-xs hidden sm:table-cell">
                  {user.gender === "male" ? "남성" : user.gender === "female" ? "여성" : "-"}
                </td>
                <td className="px-5 py-3 text-muted text-xs font-mono hidden md:table-cell">
                  {user.phone || "-"}
                </td>
                <td className="px-5 py-3 text-muted text-xs hidden lg:table-cell">
                  {user.email}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {user.status === "active" ? "활성" : "비활성"}
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

export default StudentsTable;

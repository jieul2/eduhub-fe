// src/app/(app)/classes/component/ClassesTable.tsx
"use client";

import { ClassSchedule, PopulatedClassroom, PopulatedInstructor, PopulatedSubject } from "../../../../types/classes.types";
import { deleteClass } from "../../../../lib/api/classes";
import Button from "../../../../components/ui/Button/Button";
import { Trash2 } from "lucide-react";

interface ClassesTableProps {
  classes: ClassSchedule[];
  onRefresh: () => void;
}

const ClassesTable = ({ classes, onRefresh }: ClassesTableProps) => {
  const handleDelete = async (classId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말 이 수업 일정을 삭제하시겠습니까?")) {
      try {
        await deleteClass(classId);
        onRefresh();
      } catch (error) {
        console.error("수업 삭제 실패", error);
        alert("수업 삭제에 실패했습니다.");
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_40px_-10px_rgba(0,55,72,0.08)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">상태</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">과목명</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">담당 강사</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">강의실</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">시작 시간</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label">종료 시간</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 font-label text-right">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {classes.map((c) => (
              <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    c.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {c.status === "active" ? "진행중" : "비활성"}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {(c.subjectId as PopulatedSubject)?.title || "알 수 없음"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {(c.instructorId as PopulatedInstructor)?.username || "미배정"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {(c.classroomId as PopulatedClassroom)?.classroomName || "미배정"}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {formatTime(c.startTime)}
                </td>
                <td className="px-6 py-4 text-slate-600 font-mono">
                  {formatTime(c.endTime)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button size="sm" variant="ghost" onClick={(e) => handleDelete(c._id, e)}>
                    <Trash2 className="w-4 h-4 text-danger hover:text-red-700" />
                  </Button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                  등록된 수업 일정이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClassesTable;

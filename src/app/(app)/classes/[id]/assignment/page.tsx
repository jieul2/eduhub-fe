"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDetailClass, updateClass } from "@/lib/api/classes";
import { getStudents } from "@/lib/api/student";
import { ClassData, StudentEnrollment } from "@/types/classes.types";
import Button from "@/components/ui/Button/Button";
import { Trash2, UserPlus, ArrowLeft } from "lucide-react";

interface StudentBasic {
  _id: string;
  username: string;
}

export default function StudentAssignmentPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [allStudents, setAllStudents] = useState<StudentBasic[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const detail = await getDetailClass(id);
      const studentList = await getStudents();
      setClassData(detail.classDetail);
      setAllStudents(studentList.students);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId || !classData) return;
    
    // 이미 등록된 학생인지 확인
    if (classData.students.some(s => (typeof s.studentId === 'string' ? s.studentId : s.studentId._id) === selectedStudentId)) {
      alert("이미 등록된 학생입니다.");
      return;
    }

    const newEnrollment: StudentEnrollment = {
      studentId: selectedStudentId,
      enrolledAt: new Date().toISOString()
    };

    await updateClass(id, { students: [...classData.students, newEnrollment] });
    fetchData();
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!classData) return;
    
    const updatedStudents = classData.students.filter(
      (s) => (typeof s.studentId === 'object' ? s.studentId._id : s.studentId) !== studentId
    );
    
    await updateClass(id, { students: updatedStudents });
    fetchData();
  };

  if (isLoading) return <div className="p-8 text-center">로딩중...</div>;
  if (!classData) return <div className="p-8 text-center">수업 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto bg-background min-h-screen">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="size-4 mr-2" /> 뒤로가기
      </Button>

      <div className="bg-paper rounded-3xl border border-border p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">
          {typeof classData.subjectId === 'object' ? classData.subjectId.title : '수업'} 수강생 관리
        </h1>

        {/* 학생 추가 영역 */}
        <div className="flex gap-4 mb-8">
          <select 
            className="flex-1 border border-border rounded-xl px-4 py-2 bg-background focus:ring-2 focus:ring-primary/20" 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            <option value="">학생을 선택하세요</option>
            {allStudents.map(s => (
              <option key={s._id} value={s._id}>{s.username}</option>
            ))}
          </select>
          <Button onClick={handleAddStudent}>
            <UserPlus className="size-4 mr-2"/>추가
          </Button>
        </div>

        {/* 수강생 리스트 */}
        <div className="space-y-3">
          {classData.students.length === 0 ? (
            <p className="text-center py-10 text-muted">등록된 수강생이 없습니다.</p>
          ) : (
            classData.students.map((s) => {
              const studentObj = typeof s.studentId === 'object' ? s.studentId : null;
              return (
                <div key={studentObj?._id || s.studentId as string} className="flex justify-between items-center p-4 border border-border rounded-xl">
                  <span className="font-medium">{studentObj?.username || "알 수 없는 학생"}</span>
                  <Button variant="danger" size="sm" onClick={() => handleRemoveStudent(studentObj?._id || s.studentId as string)}>
                    <Trash2 className="size-4"/>
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

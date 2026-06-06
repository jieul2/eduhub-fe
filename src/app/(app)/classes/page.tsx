"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Plus, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import Button from "../../../components/ui/Button/Button";
import AdminTimetable from "./component/AdminTimetable";
import ClassRegistrationModal from "./component/ClassRegistrationModal";
import { getTimetable } from "../../../lib/api/classes";
import { ClassData } from "../../../types/classes.types";
import { useAuthStore } from "@/store/authStore";
import InstructorTimelineView from "./component/InstructorTimelineView";
import StudentTimelineView from "./component/StudentTimelineView";

const ClassesPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 데이터 로드
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getTimetable();
    console.log("API 응답 데이터:", data);
    setClasses(data);
    setIsLoading(false);
  };

  // 시험 일정 배너 로직 (D-Day 계산)
const upcomingExams = useMemo(() => {
  if (!Array.isArray(classes)) return [];
  
  return classes.filter(c => c.targetDate && new Date(c.targetDate) > new Date());
}, [classes]);

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-3xl mx-auto w-full p-5 md:p-8 bg-background">
      
      {/* 헤더 */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">강의실 시간표</h1>
            <p className="mt-1 text-sm text-muted">주간 수업 일정 및 강의실 배정 현황</p>
          </div>
        </div>
        {isAdmin && (
          <Button size="lg" variant="primary" onClick={() => setIsOpen(true)}>
            <Plus className="size-4" /> 수업 등록
          </Button>
        )}
      </section>

      {/* 시험 일정 배너 (사용자 공통) */}
      {upcomingExams.length > 0 && (
        <section className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex items-center gap-4">
          <AlertCircle className="text-primary size-6 shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-primary">중요 시험 일정</span>
            <div className="flex gap-4 mt-1">
              {upcomingExams.map(e => (
                <span key={e._id} className="text-sm text-ink font-medium">
                  {typeof e.subjectId === 'object' ? e.subjectId.title : '시험'}: 
                  <span className="ml-1 font-bold">D-{Math.ceil((new Date(e.targetDate!).getTime() - new Date().getTime()) / (1000 * 3600 * 24))}</span>
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 모달 */}
      <ClassRegistrationModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={fetchData} 
      />
      
      {/* 역할별 뷰 전환 */}
      {isLoading ? (
        <div className="text-center py-20 text-muted">데이터를 불러오는 중...</div>
      ) : isAdmin ? (
        <AdminTimetable />
      ) : user?.role === 'instructor' ? (
        <InstructorTimelineView classes={classes} />
      ) : (
        <StudentTimelineView classes={classes} />
      )}
      
    </div>
  );
};

export default ClassesPage;

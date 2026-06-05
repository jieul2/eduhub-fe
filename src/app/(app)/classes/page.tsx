"use client";

import React, { useEffect, useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import Button from "../../../components/ui/Button/Button";
import TimeTableView from "./component/TimeTableView";
import ClassRegistrationModal from "./component/ClassRegistrationModal";
import { getTimetable } from "../../../lib/api/classes";
import { ClassData } from "../../../types/classes.types";

const ClassesPage = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // TimeTableView 내부에서 데이터를 가져오므로 여기서는 상태 관리가 단순화됩니다.
  // 필요 시 fetchTimetable을 onSuccess 콜백으로 활용할 수 있습니다.
  const refreshTimetable = () => {
    // 필요 시 TimeTableView를 새로고침하거나 데이터를 재조회하는 로직 추가
    window.location.reload(); 
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-350 mx-auto w-full p-5 md:p-8 bg-background">
      
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
        <div className="flex gap-2">
          <Button size="lg" variant="primary" onClick={() => setIsOpen(true)}>
            <Plus className="size-4" />
            수업 등록
          </Button>
        </div>
      </section>

{/* 모달 */}
      <ClassRegistrationModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onSuccess={refreshTimetable} 
      />
      
      {/* 시간표 뷰 */}
      <TimeTableView />
      
    </div>
  );
};

export default ClassesPage;

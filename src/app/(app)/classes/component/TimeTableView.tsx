// src/app/(app)/classes/component/TimeTableView.tsx
"use client";

import React, { useMemo } from "react";
import { ClassSchedule, PopulatedInstructor, PopulatedSubject, PopulatedClassroom } from "../../../../types/classes.types";
import { DAYS_KOR, getDayIndex, getTimePosition, getDurationHeight } from "../../../../utils/timeTable.utils";

interface TimeTableViewProps {
  classes: ClassSchedule[];
}

const TimeTableView = ({ classes }: TimeTableViewProps) => {
  // 수업 데이터에 따라 렌더링할 시간(Hours) 배열을 동적으로 계산합니다.
  const displayHours = useMemo(() => {
    let maxEndHour = 16; // 기본값: 16시까지 표시 (9시~16시, 즉 15:00~16:00 블록까지)
    
    classes.forEach((c) => {
      const endDate = new Date(c.endTime);
      let h = endDate.getHours();
      
      // 분 단위가 0보다 크면 (예: 16시 30분 종료) 다음 시간대(17시)까지 표시 영역을 늘림
      if (endDate.getMinutes() > 0) {
        h += 1;
      }
      
      if (h > maxEndHour) {
        maxEndHour = h;
      }
    });

    // 시작 시간(9시)부터 마지막 종료 시간 직전까지의 배열 생성
    return Array.from({ length: maxEndHour - 9 }, (_, i) => i + 9);
  }, [classes]);

  return (
    <div className="rounded-3xl border border-border bg-background shadow-sm overflow-hidden flex flex-col">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-border bg-paper">
        <div className="h-12 border-r border-border" />
        {DAYS_KOR.map((day) => (
          <div key={day} className="h-12 flex items-center justify-center font-bold text-ink text-sm border-r border-border last:border-0">
            {day}
          </div>
        ))}
      </div>

      {/* 시간 그리드 영역 
          - overflow-hidden을 사용하여 내부 스크롤을 원천적으로 차단합니다.
          - 계산된 displayHours의 갯수(시간당 60px)만큼 정확하게 높이를 지정하여 빈틈없이 맞춥니다.
      */}
      <div 
        className="relative grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] bg-background overflow-hidden"
        style={{ height: `${displayHours.length * 60}px` }}
      >
        
        {/* 시간 라벨 (좌측 축) */}
        <div className="border-r border-border">
          {displayHours.map((hour) => (
            <div key={hour} className="h-15 border-b border-border/50 flex items-start justify-center pt-2 text-[11px] font-medium text-muted">
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* 요일별 컬럼 */}
        {DAYS_KOR.map((day, idx) => (
          <div key={idx} className="relative border-r border-border/50 last:border-0">
            {/* 시간별 가로 점선 */}
            {displayHours.map((hour) => (
              <div key={hour} className="h-15 border-b border-border/30" />
            ))}
            
            {/* 실제 수업 데이터 렌더링 */}
            {classes
              .filter((c) => getDayIndex(c.startTime) === idx)
              .map((c) => {
                const top = getTimePosition(c.startTime);
                const height = getDurationHeight(c.startTime, c.endTime);
                return (
                  <div
                    key={c._id}
                    className="absolute left-1 right-1 rounded-lg p-2 text-white shadow-sm z-10 overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: "var(--color-primary)", 
                      border: "1px solid rgba(255, 255, 255, 0.2)"
                    }}
                  >
                    <div className="flex flex-col h-full">
                      <span className="text-[11px] font-bold truncate">
                        {(c.subjectId as PopulatedSubject)?.title}
                      </span>
                      <span className="text-[10px] opacity-90 truncate mt-0.5">
                        {(c.instructorId as PopulatedInstructor)?.username} • {(c.classroomId as PopulatedClassroom)?.classroomName}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimeTableView;

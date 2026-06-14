'use client';

import { useMemo } from 'react';
import { Clock, BookOpen, CalendarDays, AlertCircle } from 'lucide-react';
import { ClassData } from '@/types/classes.types';

// 월(1) ~ 토(6) 매핑 및 필터링용 데이터
const TARGET_DAYS = [1, 2, 3, 4, 5, 6];
const DAY_NAMES: Record<number, string> = {
  1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토'
};

// 개별 스케줄을 평탄화(Flatten)하기 위한 타입
interface ScheduleItem {
  classId: string;
  subjectTitle: string;
  instructorName: string;
  classroomName: string;
  targetDate: string | Date | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function StudentTimelineView({ classes = [] }: { classes?: ClassData[] }) {
  const safeClasses = Array.isArray(classes) ? classes : [];
  
  // 오늘 요일 (1: 월요일 ~ 6: 토요일)
  const currentDay = new Date().getDay();

  // 데이터를 요일 및 시간별로 평탄화하고 정렬하는 로직
  const allSchedules = useMemo(() => {
    const schedules: ScheduleItem[] = [];
    
    safeClasses.forEach((cls) => {
      if (!cls.schedules) return;
      
      cls.schedules.forEach((sched) => {
        // 월~토(1~6)만 포함
        if (TARGET_DAYS.includes(sched.dayOfWeek)) {
          schedules.push({
            classId: cls._id,
            subjectTitle: typeof cls.subjectId === 'object' ? cls.subjectId.title : '수업',
            instructorName: typeof cls.instructorId === 'object' ? cls.instructorId.username : '강사',
            classroomName: typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '강의실 미정',
            targetDate: cls.targetDate || null,
            dayOfWeek: sched.dayOfWeek,
            startTime: sched.startTime,
            endTime: sched.endTime,
          });
        }
      });
    });

    // 시작 시간 기준으로 오름차순 정렬
    return schedules.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [safeClasses]);

  // 오늘의 스케줄 필터링
  const todaysSchedules = useMemo(() => {
    return allSchedules.filter((s) => s.dayOfWeek === currentDay);
  }, [allSchedules, currentDay]);

  // 아무 수업도 없는 경우
  if (safeClasses.length === 0) {
    return (
      <div className="text-center py-10 text-muted bg-paper rounded-3xl border border-border">
        수강 중인 수업이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* 오늘의 시간표 섹션 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="size-5 text-primary" />
          <h2 className="text-xl font-extrabold text-ink">오늘의 시간표</h2>
        </div>
        
        {/* 일요일이거나 오늘 수업이 없는 경우 */}
        {todaysSchedules.length === 0 ? (
          <div className="bg-paper border border-border rounded-2xl p-6 text-center text-muted">
            오늘 예정된 수업이 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todaysSchedules.map((sched, idx) => (
              <div key={`today-${sched.classId}-${idx}`} className="bg-primary-bg border border-primary/20 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-primary">{sched.subjectTitle}</h3>
                    <p className="text-sm text-primary/80 mt-0.5">{sched.instructorName} 강사님</p>
                  </div>
                  {sched.targetDate && (
                    <span className="text-xs font-bold text-danger bg-danger-bg px-2.5 py-1 rounded-full">
                      시험 예정
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 text-sm text-ink font-medium mt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span>{sched.startTime} - {sched.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <span>{sched.classroomName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 주간 시간표 섹션 (월~토) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="size-5 text-ink" />
          <h2 className="text-xl font-extrabold text-ink">주간 시간표</h2>
        </div>

        <div className="flex flex-col gap-4">
          {TARGET_DAYS.map((day) => {
            const daySchedules = allSchedules.filter((s) => s.dayOfWeek === day);
            const isToday = currentDay === day;

            return (
              <div 
                key={day} 
                className={`flex flex-col md:flex-row gap-4 p-5 rounded-2xl border ${
                  isToday ? 'border-primary bg-primary-bg/50' : 'border-border bg-paper'
                }`}
              >
                {/* 요일 헤더 */}
                <div className="md:w-20 shrink-0 flex items-center md:items-start gap-2">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-xl font-extrabold text-lg ${
                    isToday ? 'bg-primary text-background' : 'bg-border text-ink'
                  }`}>
                    {DAY_NAMES[day]}
                  </span>
                  {isToday && <span className="text-sm font-bold text-primary md:hidden">오늘</span>}
                </div>

                {/* 해당 요일의 스케줄 리스트 */}
                <div className="flex flex-col gap-3 flex-1">
                  {daySchedules.length > 0 ? (
                    daySchedules.map((sched, idx) => (
                      <div key={`weekly-${sched.classId}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background rounded-xl border border-border shadow-sm">
                        
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-ink">{sched.subjectTitle}</span>
                            <span className="text-xs text-muted">{sched.instructorName} 강사님</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm font-medium text-ink/80">
                          <div className="flex items-center gap-1.5">
                            <Clock className="size-4 text-muted" />
                            {sched.startTime} - {sched.endTime}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="size-4 text-muted" />
                            {sched.classroomName}
                          </div>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="flex items-center h-full text-sm text-muted">
                      예정된 수업이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

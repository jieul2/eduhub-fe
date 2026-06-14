'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, BookOpen, CalendarDays, AlertCircle, CheckSquare, FileText } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import { ClassData } from '@/types/classes.types';

// 월(1) ~ 토(6) 매핑 및 필터링용 데이터
const TARGET_DAYS = [1, 2, 3, 4, 5, 6];
const DAY_NAMES: Record<number, string> = {
  1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토'
};

// 개별 스케줄을 평탄화(Flatten)하기 위한 인터페이스
interface InstructorScheduleItem {
  classId: string;
  subjectTitle: string;
  classroomName: string;
  targetDate: string | Date | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function InstructorTimelineView({ classes = [] }: { classes?: ClassData[] }) {
  const router = useRouter();
  const safeClasses = Array.isArray(classes) ? classes : [];
  
  // 오늘 요일 (1: 월요일 ~ 6: 토요일)
  const currentDay = new Date().getDay();

  // 데이터를 요일 및 시간별로 평탄화하고 정렬하는 로직
  const allSchedules = useMemo(() => {
    const schedules: InstructorScheduleItem[] = [];
    
    safeClasses.forEach((cls) => {
      if (!cls.schedules) return;
      
      cls.schedules.forEach((sched) => {
        // 월~토(1~6)만 포함
        if (TARGET_DAYS.includes(sched.dayOfWeek)) {
          schedules.push({
            classId: cls._id,
            subjectTitle: typeof cls.subjectId === 'object' ? cls.subjectId.title : '수업',
            classroomName: typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '강의실 미상',
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

  // 배정된 수업이 없는 경우
  if (safeClasses.length === 0) {
    return (
      <div className="text-center py-10 text-muted bg-paper rounded-3xl border border-border">
        배정된 수업이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      
      {/* 오늘의 시간표 섹션 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="size-5 text-primary" />
          <h2 className="text-xl font-extrabold text-ink">오늘의 강의 일정</h2>
        </div>
        
        {todaysSchedules.length === 0 ? (
          <div className="bg-paper border border-border rounded-2xl p-6 text-center text-muted">
            오늘 예정된 강의가 없습니다.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {todaysSchedules.map((sched, idx) => (
              <div key={`today-${sched.classId}-${idx}`} className="flex flex-col bg-primary-bg border border-primary/20 rounded-2xl p-5 shadow-sm">
                
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-primary">{sched.subjectTitle}</h3>
                  {sched.targetDate && (
                    <span className="text-xs font-bold text-danger bg-danger-bg px-2.5 py-1 rounded-full">
                      시험 대비
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 text-sm text-ink font-medium mt-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span>{sched.startTime} - {sched.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <span>{sched.classroomName}</span>
                  </div>
                </div>

                {/* 강사 액션 버튼 (출석부, 수업일지) */}
                <div className="flex gap-2 mt-5 pt-4 border-t border-primary/10">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-background text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => router.push(`/classes/attendance/${sched.classId}`)}
                  >
                    <CheckSquare className="size-4 mr-1.5"/> 출석부
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-background text-primary border-primary/20 hover:bg-primary/5"
                    onClick={() => router.push(`/classes/reports/${sched.classId}`)}
                  >
                    <FileText className="size-4 mr-1.5"/> 수업일지
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 주간 강의 시간표 섹션 (월~토) */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="size-5 text-ink" />
          <h2 className="text-xl font-extrabold text-ink">주간 강의 시간표</h2>
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
                      <div key={`weekly-${sched.classId}-${idx}`} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 bg-background rounded-xl border border-border shadow-sm">
                        
                        {/* 강의 기본 정보 */}
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-ink text-base">{sched.subjectTitle}</span>
                          <div className="flex items-center gap-3 text-sm font-medium text-muted">
                            <span className="flex items-center gap-1">
                              <Clock className="size-3.5" />
                              {sched.startTime} - {sched.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="size-3.5" />
                              {sched.classroomName}
                            </span>
                          </div>
                        </div>

                        {/* 강사 액션 버튼 */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/classes/attendance/${sched.classId}`)}
                          >
                            <CheckSquare className="size-4 md:mr-1"/> 
                            <span className="hidden md:inline">출석부</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/classes/reports/${sched.classId}`)}
                          >
                            <FileText className="size-4 md:mr-1"/> 
                            <span className="hidden md:inline">수업일지</span>
                          </Button>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="flex items-center h-full text-sm text-muted">
                      예정된 강의가 없습니다.
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

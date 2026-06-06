'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg } from '@fullcalendar/core';
import { EventResizeDoneArg } from '@fullcalendar/interaction';
import { X, Pencil, Check } from 'lucide-react';
import { getTimetable, updateScheduleTime } from '@/lib/api/classes';
import { ClassData } from '@/types/classes.types';
import { getDayIndex } from '@/utils/timeTable.utils';
import { useRouter } from 'next/navigation';
import {ChangedSchedule} from "@/types/classes.types";

// 시간표 고정을 위한 임의의 날짜 (2024년 1월 8일 월요일 ~ 1월 13일 토요일)
// FullCalendar에서 반복적인 주간 시간표를 표현하기 위해 사용
const getDummyDate = (dayOfWeek: number, timeStr: string) => {
  // 0(월)~5(토)을 8(월)~13(토)으로 매핑
  const baseDate = 8 + dayOfWeek;
  return `2024-01-${baseDate.toString().padStart(2, '0')}T${timeStr}:00`;
};

export default function AdminTimeTableView() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState({ instructor: '', classroom: '', subject: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  
  const changedSchedules = useRef<Map<string, ChangedSchedule>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await getTimetable();
      setClasses(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const options = useMemo(() => ({
    instructors: Array.from(new Set(classes.map(c => typeof c.instructorId === 'object' ? c.instructorId.username : ''))).filter(Boolean),
    classrooms: Array.from(new Set(classes.map(c => typeof c.classroomId === 'object' ? c.classroomId.classroomName : ''))).filter(Boolean),
    subjects: Array.from(new Set(classes.map(c => typeof c.subjectId === 'object' ? c.subjectId.title : ''))).filter(Boolean),
  }), [classes]);


  const calendarEvents = useMemo(() => {
    return classes
      .filter(cls => {
        const ins = typeof cls.instructorId === 'object' ? cls.instructorId.username : '';
        const room = typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '';
        const sub = typeof cls.subjectId === 'object' ? cls.subjectId.title : '';
        return (!filters.instructor || ins === filters.instructor) &&
               (!filters.classroom || room === filters.classroom) &&
               (!filters.subject || sub === filters.subject);
      })
      .flatMap((cls) => {
        const subjectTitle = typeof cls.subjectId === 'object' ? cls.subjectId.title : '수업';
        const eventColor = cls.color; // 과목별 고유 색상 생성

        return cls.schedules.map((schedule) => ({
          id: `${cls._id}-${schedule._id}`,
          title: subjectTitle,
          start: getDummyDate(schedule.dayOfWeek, schedule.startTime),
          end: getDummyDate(schedule.dayOfWeek, schedule.endTime),
          backgroundColor: eventColor,
          borderColor: eventColor,
          extendedProps: { 
            classId: cls._id, 
            scheduleId: schedule._id, 
            instructorName: typeof cls.instructorId === 'object' ? cls.instructorId.username : '', 
            classroomName: typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '' 
          }
        }));
      });
  }, [classes, filters]);

const handleEventChange = (info: EventDropArg | EventResizeDoneArg) => {
    const { event } = info;
    const { classId, scheduleId } = event.extendedProps;
    
    const dayOfWeek = getDayIndex(event.startStr);
    const startTime = `${String(event.start?.getHours()).padStart(2, '0')}:${String(event.start?.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(event.end?.getHours()).padStart(2, '0')}:${String(event.end?.getMinutes()).padStart(2, '0')}`;

    changedSchedules.current.set(scheduleId, { classId, scheduleId, dayOfWeek, startTime, endTime });
  };

const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates = Array.from(changedSchedules.current.values());
      await Promise.all(updates.map(u => updateScheduleTime(u.classId, u.scheduleId, u)));
      
      const updatedData = await getTimetable();
      setClasses(updatedData);
      changedSchedules.current.clear();
      setIsEditMode(false);
      alert('모든 변경사항이 저장되었습니다.');
    } catch {
      alert('저장 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isLoading && <div className="text-sm text-primary">데이터 로딩 중...</div>}
      {/* 필터 영역 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {[
            { key: 'instructor', label: '강사', list: options.instructors },
            { key: 'classroom', label: '강의실', list: options.classrooms },
            { key: 'subject', label: '과목', list: options.subjects }
          ].map(filter => (
            <select key={filter.key} className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20" value={filters[filter.key as keyof typeof filters]} onChange={e => setFilters(f => ({ ...f, [filter.key]: e.target.value }))}>
              <option value="">{filter.label} 전체</option>
              {filter.list.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          ))}
        </div>
        <button 
          onClick={() => isEditMode ? handleSave() : setIsEditMode(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isEditMode ? 'bg-primary text-white' : 'bg-border text-ink'}`}
        >
          {isEditMode ? <><Check size={16} /> 변경사항 저장</> : <><Pencil size={16} /> 일정 수정하기</>}
        </button>
      </div>
      
      {/* 필터 칩 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, val]) => val && (
          <span key={key} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {val} <X className="size-3.5 cursor-pointer" onClick={() => setFilters(f => ({ ...f, [key]: '' }))} />
          </span>
        ))}
      </div>

      {/* 캘린더 영역 */}
      <div className="w-full rounded-3xl border border-border bg-paper p-6 shadow-sm">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate="2024-01-08"
          hiddenDays={[0]}
          headerToolbar={false}
          allDaySlot={false}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          locale="ko"
          dayHeaderFormat={{ weekday: 'short' }}
          events={calendarEvents}
          editable={isEditMode}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
          eventClick={(info) => {
        const { classId } = info.event.extendedProps;
        // 관리자는 학생 배정 페이지로 이동
        router.push(`/classes/${classId}/assignment`);
      }}
          eventContent={(arg) => {
  // 수업이 너무 짧아(예: 30분 미만) 공간이 협소할 때를 위한 조건부 렌더링
  const isCompact = arg.event.end!.getTime() - arg.event.start!.getTime() < 60 * 60 * 1000;

  return (
    <div className="flex flex-col h-full overflow-hidden p-1 text-[10px] leading-tight text-white/95">
      {/* 타이틀은 항상 강조 */}
      <strong className="truncate font-bold leading-tight">
        {arg.event.title}
      </strong>
      
      {/* Compact 모드에서는 정보 한 줄로 요약 (공간 절약) */}
      {isCompact ? (
        <span className="truncate text-[9px] opacity-80">
          {arg.event.extendedProps.instructorName} · {arg.event.extendedProps.classroomName}
        </span>
      ) : (
        <>
          <span className="truncate opacity-80 mt-0.5">
            {arg.event.extendedProps.instructorName}
          </span>
          <span className="truncate mt-auto font-medium opacity-90">
            {arg.event.extendedProps.classroomName}
          </span>
        </>
      )}
    </div>
  );
}}
        />
      </div>
    </div>
  );
}

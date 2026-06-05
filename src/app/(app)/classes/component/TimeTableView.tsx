'use client';

import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg } from '@fullcalendar/core';
import { getTimetable, updateScheduleTime } from '@/lib/api/classes';
import { ClassData } from '@/types/classes.types';
import { getDayIndex } from '@/utils/timeTable.utils';

// 시간표 고정을 위한 임의의 날짜 (2024년 1월 8일 월요일 ~ 1월 13일 토요일)
// FullCalendar에서 반복적인 주간 시간표를 표현하기 위해 사용합니다.
const getDummyDate = (dayOfWeek: number, timeStr: string) => {
  // 0(월)~5(토)을 8(월)~13(토)으로 매핑
  const baseDate = 8 + dayOfWeek;
  return `2024-01-${baseDate.toString().padStart(2, '0')}T${timeStr}:00`;
};

export default function TimeTableView() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. 시간표 데이터 조회
  const fetchTimetable = async () => {
    try {
      setIsLoading(true);
      const data = await getTimetable();
      setClasses(data);
    } catch (error) {
      console.error('시간표를 불러오는 중 오류가 발생했습니다:', error);
      alert('시간표 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  // 2. FullCalendar 데이터 매핑
  const calendarEvents = classes.flatMap((cls) =>
    cls.schedules.map((schedule) => ({
      id: `${cls._id}-${schedule._id}`,
      title: typeof cls.subjectId === 'object' ? cls.subjectId.title : '수업명 미상',
      start: getDummyDate(schedule.dayOfWeek, schedule.startTime),
      end: getDummyDate(schedule.dayOfWeek, schedule.endTime),
      backgroundColor: cls.color || '#3788d8',
      borderColor: cls.color || '#3788d8',
      extendedProps: {
        classId: cls._id,
        scheduleId: schedule._id,
        instructorName: typeof cls.instructorId === 'object' ? cls.instructorId.username : '강사 미상',
        classroomName: typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '강의실 미상',
      },
    }))
  );

  // 3. 드래그 앤 드롭 이벤트 핸들러
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const { event, revert } = dropInfo;
    const { classId, scheduleId } = event.extendedProps;

    if (!event.startStr) {
      revert();
      return;
    }

    const dayOfWeek = getDayIndex(event.startStr); 
    
    const startTime = `${String(event.start?.getHours()).padStart(2, '0')}:${String(event.start?.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(event.end?.getHours()).padStart(2, '0')}:${String(event.end?.getMinutes()).padStart(2, '0')}`;

    try {
      await updateScheduleTime(classId, scheduleId, {
        dayOfWeek,
        startTime,
        endTime,
      });
    } catch (error) {
      console.error('시간 변경 실패:', error);
      alert('시간 변경 실패');
      revert();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">시간표를 불러오는 중입니다...</div>;
  }

  return (
    <div className="w-full h-full p-4 bg-white rounded-lg shadow-md">
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate="2024-01-08"
        hiddenDays={[0]} // 일요일(0) 숨김
        headerToolbar={false}
        allDaySlot={false}
        slotMinTime="08:00:00"
        slotMaxTime="22:00:00"
        locale="ko"
        dayHeaderFormat={{ weekday: 'short' }}
        events={calendarEvents}
        editable={true}
        eventDrop={handleEventDrop}
        eventContent={(arg) => (
          <div className="flex flex-col text-xs p-1 overflow-hidden h-full">
            <strong className="text-sm truncate">{arg.event.title}</strong>
            <span className="truncate">{arg.event.extendedProps.instructorName}</span>
            <span className="truncate mt-auto">{arg.event.extendedProps.classroomName}</span>
          </div>
        )}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MapPin, CheckSquare, FileText, CalendarPlus } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import { ClassData } from '@/types/classes.types';
import { DAYS_KOR } from '@/utils/timeTable.utils';

export default function InstructorTimelineView({ classes }: { classes: ClassData[] }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      {classes.map((cls) => (
        <div key={cls._id} className="bg-paper border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-ink">{typeof cls.subjectId === 'object' ? cls.subjectId.title : '수업'}</h3>
              <p className="text-sm text-muted">{typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '강의실 미상'}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full">{DAYS_KOR[cls.schedules[0]?.dayOfWeek]}요일</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/classes/attendance/${cls._id}`)}><CheckSquare className="size-4 mr-1"/>출석부</Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/classes/reports/${cls._id}`)}><FileText className="size-4 mr-1"/>수업일지</Button>
            {/* <Button variant="secondary" size="sm" onClick={() => router.push(`/classes/request/${cls._id}`)}><CalendarPlus className="size-4 mr-1"/>보강/휴강</Button> */}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { ClassData } from '@/types/classes.types';

export default function StudentTimelineView({ classes = [] }: { classes?: ClassData[] }) {
  
  // classes가 undefined/null인 경우를 대비해 확실한 배열로 변환
  const safeClasses = Array.isArray(classes) ? classes : [];

  return (
    <div className="flex flex-col gap-4">
      {/* 🚨 safeClasses를 사용 */}
      {safeClasses.length === 0 ? (
        <div className="text-center py-10 text-muted">수강 중인 수업이 없습니다.</div>
      ) : (
        safeClasses.map((cls) => (
          <div key={cls._id} className="bg-paper border border-border rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-ink">
                {typeof cls.subjectId === 'object' ? cls.subjectId.title : '수업'}
              </h3>
              {cls.targetDate && (
                <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">시험 예정</span>
              )}
            </div>
            <div className="text-sm text-muted mb-4">
              {typeof cls.instructorId === 'object' ? cls.instructorId.username : '강사'} 강사님
            </div>
            <div className="flex gap-4 text-sm text-ink/80">
              <div className="flex items-center gap-1">
                <Clock className="size-4 text-muted"/> {cls.schedules[0]?.startTime || '시간 미정'}
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="size-4 text-muted"/> 
                {typeof cls.classroomId === 'object' ? cls.classroomId.classroomName : '강의실 미정'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

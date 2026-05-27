// src/app/(app)/classes/component/ClassRegistrationModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, RotateCcw } from "lucide-react";
import Button from "../../../../components/ui/Button/Button";
import { 
  createClass, 
  getInstructorOptions, 
  getSubjectOptions, 
  getClassroomOptions,
  InstructorOption,
  SubjectOption,
  ClassroomOption
} from "../../../../lib/api/classes";
import { DAYS_KOR } from "../../../../utils/timeTable.utils";

interface ClassRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ClassFormState {
  instructorId: string;
  subjectId: string;
  classroomId: string;
  dayOfWeek: string; // "0" (월) ~ "5" (토)
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
}

const initialFormState: ClassFormState = {
  instructorId: "",
  subjectId: "",
  classroomId: "",
  dayOfWeek: "0", 
  startTime: "09:00",
  endTime: "10:00",
};

const ClassRegistrationModal = ({ isOpen, onClose, onSuccess }: ClassRegistrationModalProps) => {
  const [formData, setFormData] = useState<ClassFormState>(initialFormState);
  
  // API 옵션 데이터 상태 관리
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. 모달이 열릴 때 옵션 리스트 fetch 및 데이터 초기화 (요구사항 2)
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      setFormError(null);

      const loadOptions = async () => {
        try {
          const [insData, subData, roomData] = await Promise.all([
            getInstructorOptions(),
            getSubjectOptions(),
            getClassroomOptions()
          ]);
          setInstructors(insData);
          setSubjects(subData);
          setClassrooms(roomData);
        } catch (error) {
          console.error("옵션 리스트를 가져오는 중 오류 발생:", error);
        }
      };
      loadOptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
    };

  const handleReset = () => {
    setFormData(initialFormState);
    setFormError(null);
  };

  // 선택한 요일 인덱스와 시간 문자열을 이번 주 특정 날짜의 Date 객체로 파싱하는 헬퍼 함수
  const convertDayToDateISO = (dayIndexStr: string, timeStr: string): string => {
    const targetDayIndex = parseInt(dayIndexStr, 10); // 0 (월) ~ 5 (토)
    const now = new Date();
    const currentDay = now.getDay(); // 0 (일) ~ 6 (토)
    
    // 요일 매핑 보정 (월요일 기준 거리를 구함)
    const targetDayNum = targetDayIndex === 5 ? 6 : targetDayIndex + 1; 
    const distance = targetDayNum - currentDay;
    
    const calculatedDate = new Date(now);
    calculatedDate.setDate(now.getDate() + distance);
    
    const [hours, minutes] = timeStr.split(":").map(Number);
    calculatedDate.setHours(hours, minutes, 0, 0);
    
    return calculatedDate.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.instructorId || !formData.subjectId || !formData.classroomId) {
      setFormError("모든 필수 항목을 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 요일 기반으로 ISO 규격 문자열 생성
      const startIso = convertDayToDateISO(formData.dayOfWeek, formData.startTime);
      const endIso = convertDayToDateISO(formData.dayOfWeek, formData.endTime);

      if (new Date(endIso) <= new Date(startIso)) {
        setFormError("종료 시간은 시작 시간 이후여야 합니다.");
        return;
      }

      await createClass({
        instructorId: formData.instructorId,
        subjectId: formData.subjectId,
        classroomId: formData.classroomId,
        startTime: startIso,
        endTime: endIso,
      });

      alert("수업 일정이 추가되었습니다.");
      onSuccess();
      onClose();
    } catch (error) {
      setFormError("수업 등록 중 서버 통신에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-ink/20" onClick={onClose} />
      
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-paper shadow-2xl">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-paper px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-ink">수업 일정 추가</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              title="입력 내용 초기화"
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50 hover:text-ink"
            >
              <RotateCcw className="size-4" />
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          
          {/* 담당 강사 셀렉트박스 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">담당 강사 <span className="text-danger">*</span></label>
            <select
              required
              name="instructorId"
              value={formData.instructorId}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="" disabled className="text-muted">강사를 선택하세요</option>
              {instructors.map((ins) => (
                <option key={ins._id} value={ins._id}>{ins.username}</option>
              ))}
            </select>
          </div>

          {/* 과목 셀렉트박스 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">과목 <span className="text-danger">*</span></label>
            <select
              required
              name="subjectId"
              value={formData.subjectId}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="" disabled className="text-muted">과목을 선택하세요</option>
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>{sub.title}</option>
              ))}
            </select>
          </div>

          {/* 강의실 셀렉트박스 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">강의실 <span className="text-danger">*</span></label>
            <select
              required
              name="classroomId"
              value={formData.classroomId}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="" disabled className="text-muted">강의실을 선택하세요</option>
              {classrooms.map((room) => (
                <option key={room._id} value={room._id}>{room.classroomName}</option>
              ))}
            </select>
          </div>

          {/* 요구사항 2: 수업 날짜 대신 요일 선택으로 전면 수정 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">수업 요일 <span className="text-danger">*</span></label>
            <select
              required
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              {DAYS_KOR.map((day, idx) => (
                <option key={day} value={idx}>{day}요일</option>
              ))}
            </select>
          </div>

          {/* 시작 / 종료 시간 지정 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink flex items-center gap-1">
                시작 시간 <span className="text-danger">*</span>
              </label>
              <input 
                required
                type="time" 
                name="startTime" 
                value={formData.startTime} 
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink flex items-center gap-1">
                종료 시간 <span className="text-danger">*</span>
              </label>
              <input 
                required
                type="time" 
                name="endTime" 
                value={formData.endTime} 
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-ink transition-all focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {formError && (
            <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{formError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" size="lg" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "저장 중..." : "일정 추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassRegistrationModal;

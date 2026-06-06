"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, RotateCcw } from "lucide-react";
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
  startDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const initialFormState: ClassFormState = {
  instructorId: "",
  subjectId: "",
  classroomId: "",
  startDate: new Date().toISOString().split('T')[0],
  dayOfWeek: "0", 
  startTime: "09:00",
  endTime: "10:00",
};

const ClassRegistrationModal = ({ isOpen, onClose, onSuccess }: ClassRegistrationModalProps) => {
  const [formData, setFormData] = useState<ClassFormState>(initialFormState);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormState);
      const loadOptions = async () => {
        try {
          const [insData, subData, roomData] = await Promise.all([
            getInstructorOptions(), getSubjectOptions(), getClassroomOptions()
          ]);
          setInstructors(insData); setSubjects(subData); setClassrooms(roomData);
        } catch (error) { console.error("옵션 로드 실패:", error); }
      };
      loadOptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // startTime 변경 시 endTime 자동 +1시간 (기존 로직 유지)
    if (name === "startTime") {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours + 1, minutes);
      const newEndTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      setFormData((prev) => ({ ...prev, startTime: value, endTime: newEndTime }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setFormError(null);
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      await createClass({
        instructorId: formData.instructorId,
        subjectId: formData.subjectId,
        classroomId: formData.classroomId,
        startDate: formData.startDate,
        schedules: [{
          dayOfWeek: parseInt(formData.dayOfWeek, 10),
          startTime: formData.startTime,
          endTime: formData.endTime
        }]
      });

      alert("수업이 등록되었습니다.");
      onSuccess();
      onClose();
    } catch {
      setFormError("수업 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-ink/20" onClick={onClose} />
      
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-paper shadow-2xl">
        {/* 표준 모달 헤더 */}
        <div className="flex items-center justify-between border-b border-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Calendar className="size-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-ink">수업 일정 추가</h2>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={handleReset} className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50"><RotateCcw className="size-4" /></button>
            <button type="button" onClick={onClose} className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-border/50"><X className="size-4" /></button>
          </div>
        </div>

        {/* 폼 본문 */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {["instructorId", "subjectId", "classroomId"].map((name) => (
            <div key={name} className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">
                {name === "instructorId" ? "담당 강사" : name === "subjectId" ? "과목" : "강의실"} <span className="text-danger">*</span>
              </label>
              <select required name={name} value={formData[name as keyof ClassFormState]} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none">
                <option value="" disabled>선택하세요</option>
                {name === "instructorId" && instructors.map((ins) => <option key={ins._id} value={ins._id}>{ins.username}</option>)}
                {name === "subjectId" && subjects.map((sub) => <option key={sub._id} value={sub._id}>{sub.title}</option>)}
                {name === "classroomId" && classrooms.map((room) => <option key={room._id} value={room._id}>{room.classroomName}</option>)}
              </select>
            </div>
          ))}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">수업 시작일 <span className="text-danger">*</span></label>
            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">수업 요일 <span className="text-danger">*</span></label>
            <select required name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
              {DAYS_KOR.map((day, idx) => <option key={day} value={idx}>{day}요일</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["startTime", "endTime"].map((time) => (
              <div key={time} className="space-y-1.5">
                <label className="text-sm font-semibold text-ink">{time === "startTime" ? "시작 시간" : "종료 시간"} <span className="text-danger">*</span></label>
                <input required type="time" name={time} value={formData[time as keyof ClassFormState]} onChange={handleChange} className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
              </div>
            ))}
          </div>

          {formError && <p className="rounded-xl bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">{formError}</p>}
          
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "저장 중..." : "일정 추가"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClassRegistrationModal;

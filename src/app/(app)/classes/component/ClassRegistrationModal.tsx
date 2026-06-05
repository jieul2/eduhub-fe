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
    
    // 💡 startTime 변경 시 endTime 자동 +1시간 설정 로직
    if (name === "startTime") {
      const [hours, minutes] = value.split(':').map(Number);
      const date = new Date();
      date.setHours(hours + 1, minutes);
      
      const newEndTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      setFormData((prev) => ({ 
        ...prev, 
        startTime: value, 
        endTime: newEndTime 
      }));
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
    
    if (formData.endTime <= formData.startTime) {
      setFormError("종료 시간은 시작 시간보다 이후여야 합니다.");
      setIsSubmitting(false);
      return;
    }

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
    } catch (error) {
      setFormError("수업 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm bg-ink/20" onClick={onClose} />
      
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-paper shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-paper px-6 pb-4 pt-6">
          <h2 className="text-lg font-bold text-ink">수업 일정 추가</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink"><X className="size-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* 강사 선택 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">담당 강사 <span className="text-danger">*</span></label>
            <select required name="instructorId" value={formData.instructorId} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm">
              <option value="" disabled>강사를 선택하세요</option>
              {instructors.map((ins) => <option key={ins._id} value={ins._id}>{ins.username}</option>)}
            </select>
          </div>

          {/* 과목 선택 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">과목 <span className="text-danger">*</span></label>
            <select required name="subjectId" value={formData.subjectId} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm">
              <option value="" disabled>과목을 선택하세요</option>
              {subjects.map((sub) => <option key={sub._id} value={sub._id}>{sub.title}</option>)}
            </select>
          </div>

          {/* 강의실 선택 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">강의실 <span className="text-danger">*</span></label>
            <select required name="classroomId" value={formData.classroomId} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm">
              <option value="" disabled>강의실을 선택하세요</option>
              {classrooms.map((room) => <option key={room._id} value={room._id}>{room.classroomName}</option>)}
            </select>
          </div>

          {/* 수업 시작일 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">수업 시작일 <span className="text-danger">*</span></label>
            <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm" />
          </div>

          {/* 수업 요일 */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold">수업 요일 <span className="text-danger">*</span></label>
            <select required name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm">
              {DAYS_KOR.map((day, idx) => <option key={day} value={idx}>{day}요일</option>)}
            </select>
          </div>

          {/* 시작 / 종료 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">시작 시간</label>
              <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">종료 시간</label>
              <input required type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full rounded-xl border p-2.5 text-sm" />
            </div>
          </div>

          {formError && <p className="text-danger text-sm">{formError}</p>}
          
          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "저장 중..." : "일정 추가"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ClassRegistrationModal;

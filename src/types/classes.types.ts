// src/types/classes.types.ts

// 백엔드 populate시 select: '-_id' 로 인해 _id가 없는 객체로 반환됨을 반영
export interface PopulatedInstructor {
  _id?: string;
  username: string;
  email?: string;
}

export interface PopulatedSubject {
  _id?: string;
  title: string;
}

export interface PopulatedClassroom {
  _id?: string;
  classroomName: string;
}

export interface ScheduleItem {
  _id: string;         // 드래그 앤 드롭 등 개별 수정을 위해 반드시 필요
  dayOfWeek: number;   // 0(일) ~ 6(토)
  startTime: string;   // "09:00"
  endTime: string;     // "10:30"
}

export interface StudentEnrollment {
  studentId: string; // 필요시 PopulatedStudent 타입으로 확장 가능
  enrolledAt: string;
  droppedAt: string | null;
}

export interface ClassData {
  _id: string;
  instructorId: PopulatedInstructor | string;
  subjectId: PopulatedSubject | string;
  classroomId: PopulatedClassroom | string;
  
  startDate: string;
  endDate: string | null;
  targetDate: string | null; // D-Day 용도
  color: string;             // 캘린더 렌더링 색상
  
  schedules: ScheduleItem[];
  students: StudentEnrollment[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassPayload {
  instructorId: string;
  subjectId: string;
  classroomId: string;
  startDate: string;
  endDate?: string | null;
  targetDate?: string | null;
  color?: string;
  schedules: Omit<ScheduleItem, "_id">[];
}

export interface UpdateScheduleTimePayload {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// src/types/classes.types.ts

// 백엔드 populate시 select: '-_id' 로 인해 _id가 없는 객체로 반환됨을 반영
export interface PopulatedInstructor {
  username: string;
  email?: string;
}

export interface PopulatedSubject {
  title: string;
}

export interface PopulatedClassroom {
  classroomName: string;
}

export interface ClassSchedule {
  _id: string;
  instructorId: PopulatedInstructor | string; // 생성 시에는 string(ID)이 들어갈 수 있음
  subjectId: PopulatedSubject | string;
  classroomId: PopulatedClassroom | string;
  startTime: string;
  endTime: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassPayload {
  instructorId: string;
  subjectId: string;
  classroomId: string;
  startTime: string;
  endTime: string;
}

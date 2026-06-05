// src/lib/api/classes.ts
import axiosInstance from "../axiosInstance";
import { 
  ClassData, 
  CreateClassPayload, 
  UpdateScheduleTimePayload 
} from "../../types/classes.types";

// 드롭다운 옵션용 기본 인터페이스 정의
export interface InstructorOption {
  _id: string;
  username: string;
}

export interface SubjectOption {
  _id: string;
  title: string;
}

export interface ClassroomOption {
  _id: string;
  classroomName: string;
}

export const getClasses = async (): Promise<ClassData[]> => {
  const response = await axiosInstance.get<{ classes: ClassData[] }>("/classes");
  return response.data.classes;
};

// 시간표 전용 조회 (현재 활성화된 수업만 반환)
export const getTimetable = async (): Promise<ClassData[]> => {
  const response = await axiosInstance.get<{ classes: ClassData[] }>("/classes/timetable");
  return response.data.classes;
};

// 수업 상세 조회
export const getClassDetail = async (classId: string): Promise<ClassData> => {
  const response = await axiosInstance.get<{ classDetail: ClassData }>(`/classes/${classId}`);
  return response.data.classDetail;
};

// 수업 생성
export const createClass = async (payload: CreateClassPayload): Promise<ClassData> => {
  const response = await axiosInstance.post<{ message: string; class: ClassData }>("/classes", payload);
  return response.data.class;
};

// 수업 전체 수정 (PUT)
export const updateClass = async (classId: string, payload: Partial<CreateClassPayload & { status: "active" | "inactive" }>): Promise<ClassData> => {
  const response = await axiosInstance.put<{ message: string; class: ClassData }>(`/classes/${classId}`, payload);
  return response.data.class;
};

// 수업 삭제
export const deleteClass = async (classId: string): Promise<void> => {
  await axiosInstance.delete(`/classes/${classId}`);
};

// 특정 스케줄(시간표 블록) 부분 수정 (드래그 앤 드롭용 PATCH)
export const updateScheduleTime = async (
  classId: string,
  scheduleId: string,
  payload: UpdateScheduleTimePayload
): Promise<ClassData> => {
  const response = await axiosInstance.patch<{ message: string; class: ClassData }>(
    `/classes/${classId}/schedules/${scheduleId}`,
    payload
  );
  return response.data.class;
};

// ─── 드롭다운 데이터 전용 조회 API ──────────────────────────────────────────
// 1. 강사 목록 가져오기 (경로 수정: /users/instructors -> /user/instructors)
export const getInstructorOptions = async (): Promise<InstructorOption[]> => {
  try {
    const response = await axiosInstance.get("/user/instructors");
    return response.data.instructors || response.data;
  } catch (error) {
    console.error("강사 목록 로드 실패", error);
    return [];
  }
};

// 2. 과목 목록 가져오기 (경로는 맞으나 401 에러 대비)
export const getSubjectOptions = async (): Promise<SubjectOption[]> => {
  try {
    const response = await axiosInstance.get("/subject");
    return response.data.subjects || response.data;
  } catch (error) {
    console.error("과목 목록 로드 실패", error);
    return [];
  }
};

// 3. 강의실 목록 가져오기 (경로 수정: /classroom -> /classrooms)
export const getClassroomOptions = async (): Promise<ClassroomOption[]> => {
  try {
    const response = await axiosInstance.get("/classrooms");
    return response.data.classrooms || response.data;
  } catch (error) {
    console.error("강의실 목록 로드 실패", error);
    return [];
  }
};

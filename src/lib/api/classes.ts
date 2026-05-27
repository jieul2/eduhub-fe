// src/lib/api/classes.ts
import axiosInstance from "../axiosInstance";
import { ClassSchedule, CreateClassPayload } from "../../types/classes.types";

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

export const getClasses = async (): Promise<{ classes: ClassSchedule[] }> => {
  const response = await axiosInstance.get("/classes");
  return response.data;
};

export const createClass = async (payload: CreateClassPayload): Promise<{ message: string; class: ClassSchedule }> => {
  const response = await axiosInstance.post("/classes", payload);
  return response.data;
};

export const deleteClass = async (classId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/classes/${classId}`);
  return response.data;
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

import axios from "axios";
import { StateCreator } from "zustand";
import api from "../../lib/axiosInstance";
import type { Student, StudentPagination } from "./student.types";

interface StudentSlice {
  students: Student[];
  pagination: StudentPagination;
  isLoading: boolean;
  error: string | null;
  fetchStudents: (params?: { page: number; limit: number; name?: string }) => Promise<void>;
}

const createStudentSlice: StateCreator<
  StudentSlice,
  [["zustand/devtools", never]],
  [],
  StudentSlice
> = (set) => ({
  students: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  fetchStudents: async (params = { page: 1, limit: 10 }) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get("/students", { params });
      if (!response) {
        throw new Error("Failed to fetch students");
      }
      console.log("Fetched students data:", response.data.pagination);
      set({
        students: response.data.students,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? (error.response?.data?.message ?? error.message)
        : error instanceof Error ? error.message : "오류가 발생했습니다.";
      set({ students: [], error: message, isLoading: false });
    }
  },
});

export { createStudentSlice };
export type { StudentSlice };

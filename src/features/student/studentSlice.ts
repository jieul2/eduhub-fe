import { StateCreator } from "zustand";
import api from "../../lib/axiosInstance";

export interface Student {
  username: string;
  role: string;
  status: string;
  gender: string;
  birthDate: string;
  phone: string;
  email: string;
}

interface StudentSlice {
  students: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchStudents: (params?: { page: number; limit: number; name?: string}) => Promise<void>;
}

const createStudentSlice: StateCreator<
  StudentSlice,
  [["zustand/devtools", never]],
  [],
  StudentSlice
> = (set, get) => ({
  students: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  fetchStudents: async (params = {page:1, limit:10}) => {
    try {
      // pending 상태 업데이트
      set({ isLoading: true, error: null });
      const response = await api.get("/students", { params });
      if (!response) {
        throw new Error("Failed to fetch students");
      }
      console.log("Fetched students data:", response.data.pagination);
      // fulfilled 상태 업데이트
      set({ students: response.data.students, pagination: response.data.pagination, isLoading: false });
    } catch (error) {
      if (error instanceof Error) {
        // rejected 상태 업데이트
        set({ students: [], error: error.message, isLoading: false });
      } else {
        // rejected 상태 업데이트
        set({ students: [], error: "An unknown error occurred", isLoading: false });
      }
    }
  },
});

export { createStudentSlice };
export type { StudentSlice };

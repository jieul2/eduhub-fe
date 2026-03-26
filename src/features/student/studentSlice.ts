import { StateCreator } from "zustand";
import api from "../../lib/axiosInstance";

interface Student {
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
  isLoading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
}

const createStudentSlice: StateCreator<
  StudentSlice,
  [["zustand/devtools", never]],
  [],
  StudentSlice
> = (set, get) => ({
  students: [],
  isLoading: false,
  error: null,
  fetchStudents: async () => {
    try {
      // pending 상태 업데이트
      set({ isLoading: true, error: null });
      const response = await api.get("/students");
      if (!response) {
        throw new Error("Failed to fetch students");
      }
      // fulfilled 상태 업데이트
      set({ students: response.data.students, isLoading: false });
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

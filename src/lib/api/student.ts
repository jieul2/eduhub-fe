// src/lib/api/student.ts
import axiosInstance from "../axiosInstance";

export const getStudents = async () => {
  const response = await axiosInstance.get("/students");
  return response.data;
};

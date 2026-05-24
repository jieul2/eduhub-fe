import axiosInstance from '@/lib/axiosInstance';
import { SignupRequest, SigninRequest, AuthResponse, User } from '@/types/auth.types';
import { AxiosError } from 'axios';

export const authApi = {
  // 회원가입 API
  signup: async (data: SignupRequest): Promise<AuthResponse<User>> => {
    try {
      const response = await axiosInstance.post<AuthResponse<User>>('/auth/signup', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<AuthResponse>;
      throw new Error(axiosError.response?.data?.error || '회원가입에 실패했습니다.');
    }
  },

  // 로그인 API
  signin: async (data: SigninRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/signin', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<AuthResponse>;
      throw new Error(axiosError.response?.data?.error || '로그인에 실패했습니다.');
    }
  }
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'instructor' | 'user';

export interface User {
  _id: string;
  userName: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      // 로그인 성공 시
      login: (token) => {
        localStorage.setItem('auth-token', token);
        set({isLoggedIn: true });
      },

      // 로그아웃 시
      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, isLoggedIn: false });
        
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

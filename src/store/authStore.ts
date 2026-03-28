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
        
        try {
          // 디코딩하여 유저 정보 추출 (한글 깨짐 방지)
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
          );
          
          const payload = JSON.parse(jsonPayload);

          // 추출한 정보를 전역 user 상태에 세팅
          set({
            isLoggedIn: true,
            user: {
              _id: payload.id,
              userName: payload.username,
              email: payload.email,
              role: payload.role,
            }
          });
        } catch (error) {
          console.error('토큰 디코딩 실패:', error);
          set({ isLoggedIn: true });
        }
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

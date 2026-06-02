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
  _hasHydrated: boolean;

  login: (token: string) => void;
  logout: () => void;
  _setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      _hasHydrated: false,

      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: (token) => {
        localStorage.setItem('auth-token', token);

        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
          );

          const payload = JSON.parse(jsonPayload);

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

      logout: () => {
        localStorage.removeItem('auth-token');
        set({ user: null, isLoggedIn: false });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
    }
  )
);

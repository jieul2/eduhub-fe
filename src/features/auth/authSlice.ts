import { StateCreator } from "zustand";

interface User {
  _id: string;
  userName: string;
  role: 'admin' | 'instructor' | 'user';
}

interface AuthSlice {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  isLoggedIn: false,
  login: (userData) => set({ user: userData, isLoggedIn: true }),
  logout: () => {
    localStorage.removeItem("auth-token");
    set({ user: null, isLoggedIn: false });
  },
});

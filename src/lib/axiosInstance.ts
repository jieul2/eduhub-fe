import axios, { InternalAxiosRequestConfig } from "axios";
import { logStore } from "./logStore";
import { useAuthStore } from "@/store/authStore";

// axios config에 커스텀 필드 타입 확장
declare module "axios" {
  interface InternalAxiosRequestConfig {
    __startTime?: number;
  }
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.__startTime = Date.now();

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      logStore.add({
        timestamp: new Date(),
        level: "info",
        method: config.method?.toUpperCase() ?? "GET",
        url: config.url ?? "",
      });
    }

    return config;
  },
  (error: unknown) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined") {
      const startTime = response.config.__startTime;
      const duration = startTime !== undefined ? Date.now() - startTime : undefined;
      logStore.add({
        timestamp: new Date(),
        level: "success",
        method: response.config.method?.toUpperCase() ?? "GET",
        url: response.config.url ?? "",
        status: response.status,
        duration,
      });
    }
    return response;
  },
  (error: unknown) => {
    if (typeof window !== "undefined" && axios.isAxiosError(error)) {
      const startTime = error.config?.__startTime;
      const duration = startTime !== undefined ? Date.now() - startTime : undefined;
      const status = error.response?.status ?? 0;

      logStore.add({
        timestamp: new Date(),
        level: status >= 400 ? "error" : "warn",
        method: error.config?.method?.toUpperCase() ?? "GET",
        url: error.config?.url ?? "",
        status,
        duration,
      });

      if (status === 401 && useAuthStore.getState()._hasHydrated) {
        localStorage.removeItem("auth-token");
        useAuthStore.setState({ user: null, isLoggedIn: false });
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

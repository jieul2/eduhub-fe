import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("Axios instance created with baseURL:", process.env.NEXT_PUBLIC_API_URL);

// 요청 인터셉터: 로깅 + 인증 토큰 삽입
axiosInstance.interceptors.request.use(
  (config) => {
    // 1. 요청 로깅
    console.log("▶️ [Start] Request", config.method?.toUpperCase(), config.url);

    // 2. 토큰 삽입 (클라이언트 사이드 브라우저 환경 확인)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth-token");
      if (token) {
        // 백엔드 authMiddleware의 Bearer 토큰 검증 방식에 맞춤
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ [Error] Request", error);
    return Promise.reject(error);
  },
);

// 응답 인터셉터: 로깅 + 공통 에러 처리
axiosInstance.interceptors.response.use(
  (response) => {
    // 응답 성공 로깅
    console.log("✅ [Success] Response", response.status, response.config.url);
    return response;
  },
  (error) => {
    // 응답 에러 로깅
    console.error("❌ [Error] Response", error.response?.status, error.message);

    // 공통 에러 처리: 401(인증 만료/실패) 시 처리
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        console.warn("인증이 만료되었습니다. 로그인이 필요합니다.");
        localStorage.removeItem("auth-token");
        // 필요 시 window.location.href = "/login" 등으로 이동 처리
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

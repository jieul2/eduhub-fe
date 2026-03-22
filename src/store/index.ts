// src/store/index.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
// 1. 각 슬라이스의 타입 정의

// 2. 모든 슬라이스 타입을 합친 전체 스토어 타입 정의
type TotalStore = undefined;

// 3. 통합 스토어 생성
export const useStore = create<TotalStore>()(
  devtools((...a) => ({
    // 새로운 기능(슬라이스)이 생길 때마다 여기에 추가하면 됩니다.
  })),
);

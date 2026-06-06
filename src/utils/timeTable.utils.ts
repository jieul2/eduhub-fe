// src/utils/timeTable.utils.ts
export const DAYS_KOR = ["월", "화", "수", "목", "금", "토"];
export const HOURS = Array.from({ length: 14 }, (_, i) => i + 9); // 09:00 ~ 22:00

export const getDayIndex = (dateString: string): number => {
  const date = new Date(dateString);
  const day = date.getDay(); // 0(일) ~ 6(토)
  return day === 0 ? 6 : day - 1; // 월요일을 0으로 맞춤
};

export const getTimePosition = (dateString: string): number => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // 9시부터 시작하므로 (현재시간 - 9) * 60px(1시간 높이) + (분/60 * 60px)
  return (hours - 9) * 60 + minutes;
};

export const getDurationHeight = (start: string, end: string): number => {
  const durationMs = new Date(end).getTime() - new Date(start).getTime();
  return (durationMs / (1000 * 60 * 60)) * 60; // 1시간당 60px 기준
};

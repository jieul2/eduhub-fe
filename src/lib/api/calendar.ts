import axiosInstance from '@/lib/axiosInstance';
import { AxiosError } from 'axios';
import {
  CalendarEvent,
  CalendarEventForm,
  CalendarEventsResponse,
  CalendarEventResponse,
} from '@/features/calendar/calendar.types';

export const calendarApi = {
  // 이벤트 목록 조회
  getEvents: async (): Promise<CalendarEventsResponse> => {
    try {
      const response = await axiosInstance.get<CalendarEventsResponse>('/calendar');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || '일정을 불러오지 못했습니다.');
    }
  },

  // 이벤트 단건 조회
  getEvent: async (eventId: string): Promise<CalendarEvent> => {
    try {
      const response = await axiosInstance.get<CalendarEventResponse>(`/calendar/${eventId}`);
      return response.data.event;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || '일정을 불러오지 못했습니다.');
    }
  },

  // 이벤트 생성
  createEvent: async (data: CalendarEventForm): Promise<CalendarEvent> => {
    try {
      const response = await axiosInstance.post<CalendarEventResponse>('/calendar', data);
      return response.data.event;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || '일정을 등록하지 못했습니다.');
    }
  },

  // 이벤트 수정
  updateEvent: async (eventId: string, data: CalendarEventForm): Promise<CalendarEvent> => {
    try {
      const response = await axiosInstance.put<CalendarEventResponse>(`/calendar/${eventId}`, data);
      return response.data.event;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || '일정을 수정하지 못했습니다.');
    }
  },

  // 이벤트 삭제
  deleteEvent: async (eventId: string): Promise<void> => {
    try {
      await axiosInstance.delete(`/calendar/${eventId}`);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || '일정을 삭제하지 못했습니다.');
    }
  },
};

import { StateCreator } from 'zustand';
import { calendarApi } from '../../lib/api/calendar';
import { CalendarEvent, CalendarEventForm } from './calendar.types';

interface CalendarSlice {
  events: CalendarEvent[];
  isCalendarLoading: boolean;
  calendarError: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (data: CalendarEventForm) => Promise<CalendarEvent>;
  updateEvent: (eventId: string, data: CalendarEventForm) => Promise<CalendarEvent>;
  deleteEvent: (eventId: string) => Promise<void>;
}

const createCalendarSlice: StateCreator<
  CalendarSlice,
  [['zustand/devtools', never]],
  [],
  CalendarSlice
> = (set) => ({
  events: [],
  isCalendarLoading: false,
  calendarError: null,

  fetchEvents: async () => {
    try {
      set({ isCalendarLoading: true, calendarError: null });
      const response = await calendarApi.getEvents();
      set({ events: response.events, isCalendarLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({ events: [], calendarError: message, isCalendarLoading: false });
    }
  },

  createEvent: async (data: CalendarEventForm) => {
    const newEvent = await calendarApi.createEvent(data);
    set((state) => ({ events: [...state.events, newEvent] }));
    return newEvent;
  },

  updateEvent: async (eventId: string, data: CalendarEventForm) => {
    const updated = await calendarApi.updateEvent(eventId, data);
    set((state) => ({
      events: state.events.map((e) => (e._id === eventId ? updated : e)),
    }));
    return updated;
  },

  deleteEvent: async (eventId: string) => {
    await calendarApi.deleteEvent(eventId);
    set((state) => ({
      events: state.events.filter((e) => e._id !== eventId),
    }));
  },
});

export { createCalendarSlice };
export type { CalendarSlice };

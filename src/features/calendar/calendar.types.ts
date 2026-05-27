export type CalendarCategory = string;

export interface CalendarEvent {
  _id: string;
  userId: string;
  title: string;
  start: string;
  end: string;
  category: CalendarCategory;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarEventForm {
  title: string;
  start: string;
  end: string;
  category: string;
  description: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
}

export interface CalendarEventResponse {
  event: CalendarEvent;
}

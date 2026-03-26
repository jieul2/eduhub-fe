import { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'instructor' | 'user';

export interface User {
    _id: string;
    userName: string;
    role: UserRole;
}

export interface ClassSchedule {
    _id: string;
    className: string;
    time: string;
    room: string;
    teacherName?: string;
}

export interface CalendarEvent {
    _id: string;
    title: string;
    category: string;
    time: string;
    assignee?: string;
}

export interface AdminStats {
    unpaidCount: number;
    absentCount: number;
    totalClassesToday: number;
}

export interface TeacherStats {
    myClassesToday: number;
    completedClasses: number;
}

export interface DashboardData {
    user: User;
    todayClasses: ClassSchedule[];
    calendarEvents: CalendarEvent[];
    adminStats?: AdminStats;
    teacherStats?: TeacherStats;
}

export interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    colorClass: string;
}

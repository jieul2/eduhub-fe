import type { Pagination } from "@/types/pagination.types";

export type { Pagination as StudentPagination };

export interface Student {
	_id: string;
	username: string;
	role: string;
	status: string;
	gender?: string;
	birthDate?: string;
	phone?: string;
	email: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface StudentAchievement {
	_id: string;
	score: number;
	subjectId?: {
		_id?: string;
		title?: string;
	} | null;
	createdAt?: string;
}

export interface StudentClassItem {
	_id: string;
	status: string;
	startTime?: string;
	endTime?: string;
	subjectId?: {
		_id?: string;
		title?: string;
	} | null;
	instructorId?: {
		_id?: string;
		username?: string;
		email?: string;
	} | null;
	classroomId?: {
		_id?: string;
		classroomName?: string;
	} | null;
}

export interface StudentCounsel {
	_id: string;
	text: string;
	consultation_type: "student" | "parent";
	instructorId?: {
		_id?: string;
		username?: string;
	} | null;
	start?: string;
	end?: string;
	createdAt?: string;
}

export interface StudentPayment {
	_id: string;
	amount: number;
	status: "pending" | "completed" | "failed";
	createdAt?: string;
	updatedAt?: string;
}

export interface StudentAttendance {
	_id: string;
	classId?: string;
	status: "present" | "absent" | "late";
	date?: string;
	reason?: string;
	createdAt?: string;
}

export interface StudentParentLink {
	_id: string;
	parentId?: {
		_id?: string;
		username?: string;
		email?: string;
		phone?: string;
	} | null;
}

export interface StudentDetailResponse {
	student: Student;
	achievements: StudentAchievement[];
	classes: StudentClassItem[];
	counsels: StudentCounsel[];
	payments: StudentPayment[];
	attendances: StudentAttendance[];
	parents: StudentParentLink[];
}

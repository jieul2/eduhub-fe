import type { Pagination } from "./pagination.types";

export type { Pagination };

export interface Payment {
  _id: string;
  studentId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  user?: {
    username?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: Pagination;
}

export interface PaymentDetailResponse {
  payment: Payment;
}
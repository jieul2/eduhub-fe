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

export interface PaymentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: PaymentPagination;
}

export interface PaymentDetailResponse {
  payment: Payment;
}
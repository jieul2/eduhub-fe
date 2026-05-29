import axios from "axios";
import { StateCreator } from "zustand";
import api from "../../lib/axiosInstance";
import type { Payment, Pagination } from "@/types/payment.types";

interface PaymentSlice {
    payments: Payment[];
    pagination: Pagination;
    isLoading: boolean;
    error: string | null;
    fetchPayments: (params?: { page: number; limit: number }) => Promise<void>;
}

const createPaymentSlice: StateCreator<
    PaymentSlice,
    [["zustand/devtools", never]],
    [],
    PaymentSlice
> = (set) => ({
    payments: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    isLoading: false,
    error: null,
    fetchPayments: async (params = { page: 1, limit: 10 }) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get("/payments", { params });
            if (!response) {
                throw new Error("Failed to fetch payments");
            }
            set({
                payments: response.data.payments,
                pagination: response.data.pagination,
                isLoading: false,
            });
        } catch (error) {
            const message = axios.isAxiosError<{ message?: string }>(error)
              ? (error.response?.data?.message ?? error.message)
              : error instanceof Error ? error.message : "오류가 발생했습니다.";
            set({ payments: [], error: message, isLoading: false });
        }
    },
});

export { createPaymentSlice };
export type { PaymentSlice };


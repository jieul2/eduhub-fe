import { StateCreator } from "zustand";
import api from "../../lib/axiosInstance";
import type { Pagination, Payment } from "../../types/payment.types";

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
            if (error instanceof Error) {
                set({ payments: [], error: error.message, isLoading: false });
            } else {
                set({ payments: [], error: "An unknown error occurred", isLoading: false });
            }
        }
    },
});

export { createPaymentSlice };
export type { PaymentSlice };


import { StateCreator } from "zustand";
import api from "../../lib/axiosInstance";
import { Student } from "../student/studentSlice";




interface Payment {
    user: Student;
    amount: number;
    status: string;
}

interface PaymentSlice {
    payments: Payment[];
    isLoading: boolean;
    error: string | null;
    fetchPayments: () => Promise<void>;
}

const createPaymentSlice: StateCreator<
    PaymentSlice,
    [["zustand/devtools", never]],
    [],
    PaymentSlice
> = (set, get) => ({
    payments: [],
    isLoading: false,
    error: null,
    fetchPayments: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get("/payments");
            if (!response) {
                throw new Error("Failed to fetch payments");
            }
            set({ payments: response.data.payments, isLoading: false });
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


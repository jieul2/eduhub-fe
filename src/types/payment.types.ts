export interface Payment {
  user: {
    username: string;
    role: string;
    status: string;
    gender: string;
    birthDate: string;
    phone: string;
    email: string;
  };
  amount: number;
  status: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
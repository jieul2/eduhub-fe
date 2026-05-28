"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Search } from "lucide-react";
import Pagination from "../../../components/pagination/Pagination";
import api from "../../../lib/axiosInstance";
import PaymentsTable from "./component/paymentsTable";
import { Payment, PaymentListResponse } from "../../../features/payment/payment.types";

export default function PaymentsPage() {
  const router = useRouter();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const fetchPayments = async (page: number, limit: number, name?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get<PaymentListResponse>("/payments", {
        params: { page, limit, ...(name ? { name } : {}) },
      });
      setPayments(Array.isArray(response.data.payments) ? response.data.payments : []);
      setPagination(response.data.pagination);
    } catch (fetchError) {
      setPayments([]);
      setError(fetchError instanceof Error ? fetchError.message : "결제 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchPayments(1, itemsPerPage, debouncedQuery || undefined);
  }, [itemsPerPage, debouncedQuery]);

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto w-full p-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">관리</span>
          <h1 className="text-3xl font-bold text-ink tracking-tight">결제 관리</h1>
          <p className="text-sm text-muted">학생별 결제 금액과 상태를 조회하고 관리합니다.</p>
        </div>
        <button
          onClick={() => router.push("/payments/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          결제 등록
        </button>
      </section>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-paper rounded-xl border border-border">
        <div className="flex items-center gap-2 text-sm text-muted font-medium shrink-0">
          <CreditCard className="w-4 h-4" />
          <span className="text-xs font-medium">
            총 <span className="text-ink font-bold">{pagination.total}</span>건
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>페이지당</span>
          <select
            className="border border-border rounded-md px-2 py-1 text-xs text-ink bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={10}>10개</option>
            <option value={25}>25개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
        </div>
        <div className="ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            className="pl-8 pr-3 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background w-44"
            placeholder="학생 이름 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* Table */}
      <div className="bg-paper rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <CreditCard className="w-5 h-5 text-primary" />
          <span className="font-semibold text-ink text-sm">결제 목록</span>
          <span className="text-xs font-medium text-muted bg-border/60 px-2.5 py-0.5 rounded-full">
            총 {pagination.total.toLocaleString()}건
          </span>
        </div>
        {isLoading ? (
          <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
        ) : payments.length === 0 ? (
          <div className="py-20 text-center">
            <CreditCard className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">결제 내역이 없습니다.</p>
          </div>
        ) : (
          <PaymentsTable payments={payments} />
        )}
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => fetchPayments(newPage, itemsPerPage, debouncedQuery || undefined)}
      />
    </div>
  );
}

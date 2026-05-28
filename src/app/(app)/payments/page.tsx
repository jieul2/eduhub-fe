"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import Pagination from "../../../components/pagination/Pagination";
import api from "../../../lib/axiosInstance";
import PaymentsTable from "./component/paymentsTable";
import { Payment, PaymentListResponse } from "../../../features/payment/payment.types";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { Alert } from "@/components/ui/Alert/Alert";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import Button from "@/components/ui/Button/Button";

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
      <PageHeader
        label="관리"
        title="결제 관리"
        description="학생별 결제 금액과 상태를 조회하고 관리합니다."
        actions={
          <Button
            variant="primary"
            radius="lg"
            onClick={() => router.push("/payments/new")}
          >
            <CreditCard className="w-4 h-4" />
            결제 등록
          </Button>
        }
      />

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
        <div className="ml-auto">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 이름 검색"
          />
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <SectionCard
        icon={<CreditCard className="w-5 h-5" />}
        title="결제 목록"
        badge={`총 ${pagination.total.toLocaleString()}건`}
      >
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
      </SectionCard>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => fetchPayments(newPage, itemsPerPage, debouncedQuery || undefined)}
      />
    </div>
  );
}

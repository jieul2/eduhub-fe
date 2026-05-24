"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Info, Search, Download, ListFilter } from "lucide-react";
import Pagination from "../../../components/pagination/Pagination";
import api from "../../../lib/axiosInstance";
import InputWithIcon from "../../../components/ui/input-with-icon/InputWithIcon";
import Button from "../../../components/ui/Button/Button";
import PaymentsTable from "./component/paymentsTable";
import { Payment, PaymentListResponse } from "../../../features/payment/payment.types";

export default function PaymentsPage() {
  const router = useRouter();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
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
      if (fetchError instanceof Error) {
        setError(fetchError.message);
      } else {
        setError("결제 목록을 불러오지 못했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchPayments(1, itemsPerPage, debouncedQuery || undefined);
  }, [itemsPerPage, debouncedQuery]);

  return (
    <div className="mt-5 p-8 space-y-8 max-w-400 mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            결제조회 (Table View)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor all student payment records within the institution.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="lg" variant="primary" onClick={() => router.push("/payments/new")}>
            <CreditCard className="w-4 h-4" />
            결제 등록
          </Button>
        </div>
      </div>

      <section className="bg-surface-container-low p-6 rounded-xl border-l-[3px] border-primary flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface-variant text-base">결제 정보 안내</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            결제 목록에서는 학생별 결제 금액과 상태를 한눈에 확인할 수 있습니다. 상세 조회를
            원하시면 학생명을 클릭하십시오. 상태는 미납, 완료, 실패로 구분되어 운영 현황을 빠르게
            파악할 수 있습니다.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg text-sm text-slate-600 font-medium border border-slate-100">
            <input
              className="rounded border-slate-300 text-primary focus:ring-primary"
              type="checkbox"
            />
            <span>전체 선택</span>
          </div>
          <div className="text-sm text-slate-500">
            총 <span className="text-blue-700 font-bold">{pagination.total}</span> 건
          </div>
          <div className="h-4 w-px bg-slate-200"></div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <select
              className="bg-transparent border-none focus:ring-0 text-sm font-bold p-0 pr-6"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span>개씩 보기</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <InputWithIcon
              size="md"
              color="default"
              readOnly={false}
              leftIcon={<Search />}
              placeholder="학생 이름 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button size="icon" variant="background">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="background">
            <ListFilter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {isLoading ? <p className="text-sm text-slate-500">결제 목록을 불러오는 중입니다...</p> : null}

      <PaymentsTable payments={Array.isArray(payments) ? payments : []} />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => fetchPayments(newPage, itemsPerPage, debouncedQuery || undefined)}
      />
    </div>
  );
}

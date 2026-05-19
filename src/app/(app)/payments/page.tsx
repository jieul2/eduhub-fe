"use client";

import { Info, UserPlus, Download, ListFilter } from "lucide-react";
import React from "react";
import Button from "../../../components/ui/Button/Button";
import { useStore } from "../../../store";
import Pagination from "../../../components/pagination/Pagination";
import InputWithIcon from "../../../components/ui/input-with-icon/InputWithIcon";
import { Search } from "lucide-react";
import PaymentsTable from "./component/paymentsTable";

const Payments = () => {
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const { payments, fetchPayments, pagination } = useStore();
  const todayStr = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());

  React.useEffect(() => {
    fetchPayments({ page: 1, limit: itemsPerPage });
  }, [fetchPayments, itemsPerPage]);

  return (
    <div className="flex flex-col gap-10 pb-12 max-w-400 mx-auto w-full p-8">
      {/* 헤더 */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-primary">{todayStr}</span>
          <h1 className="text-3xl font-bold text-ink md:text-4xl tracking-tight">
            결제 관리
          </h1>
        </div>
        <div className="flex gap-2">
          <Button size="lg" variant="primary" onClick={() => {}}>
            <UserPlus className="w-4 h-4" />
            결제 등록
          </Button>
        </div>
      </section>

      {/* 안내 영역 */}
      <section className="bg-surface-container-low p-6 rounded-xl border-l-[3px] border-primary flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface-variant text-base">결제 정보 안내</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            결제 내역에서는 학생별 결제 상태, 미납 내역, 결제일 등 주요 정보를 한눈에 확인할 수 있습니다. 상세 조회를 원하시면 학생명을 클릭하십시오.
          </p>
        </div>
      </section>

      {/* Filters and Actions */}
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
              placeholder="Search"
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

      {/* 결제 데이터 테이블 */}
      <PaymentsTable payments={Array.isArray(payments) ? payments : []} />

      {/* 페이지네이션 */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => fetchPayments({ page: newPage, limit: itemsPerPage })}
      />
    </div>
  );
};

export default Payments;

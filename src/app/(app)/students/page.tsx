"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../../../store";
import StudentsTable from "./component/studentsTable";
import Pagination from "../../../components/pagination/Pagination";
import StudentRegistrationModal from "./component/StudentRegistrationModal";

const Students = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { students, pagination, fetchStudents } = useStore();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchStudents({ page: 1, limit: itemsPerPage, name: debouncedQuery || undefined });
  }, [fetchStudents, itemsPerPage, debouncedQuery]);

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto w-full p-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">관리</span>
          <h1 className="text-3xl font-bold text-ink tracking-tight">학생 관리</h1>
          <p className="text-sm text-muted">등록된 학생 목록을 조회하고 상세 정보를 확인합니다.</p>
        </div>
        <button
          onClick={() => router.push("/students/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          학생 등록
        </button>
      </section>

      <StudentRegistrationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-paper rounded-xl border border-border">
        <div className="flex items-center gap-2 text-sm text-muted font-medium shrink-0">
          <Users className="w-4 h-4" />
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

      {/* Table */}
      <div className="bg-paper rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-semibold text-ink text-sm">학생 목록</span>
          <span className="text-xs font-medium text-muted bg-border/60 px-2.5 py-0.5 rounded-full">
            총 {pagination.total.toLocaleString()}명
          </span>
        </div>
        <StudentsTable users={Array.isArray(students) ? students : []} />
      </div>

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) =>
          fetchStudents({ page: newPage, limit: itemsPerPage, name: debouncedQuery || undefined })
        }
      />
    </div>
  );
};

export default Students;

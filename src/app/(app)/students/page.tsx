"use client";

import { Info, UserPlus, Search, Download, ListFilter } from "lucide-react";
import StudentsTable from "./component/studentsTable";
import InputWithIcon from "../../../components/ui/input-with-icon/InputWithIcon";
import Button from "../../../components/ui/Button/Button";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../../store";
import Pagination from "../../../components/pagination/Pagination";

const Students = () => {
  // n개씩 보기 useState구현
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { students, pagination, fetchStudents } = useStore();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchStudents({ page: 1, limit: itemsPerPage, name: debouncedQuery || undefined });
  }, [fetchStudents, itemsPerPage, debouncedQuery]);

  return (
    <div className="mt-5 p-8 space-y-8 max-w-400 mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            학생조회 (Table View)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor all registered students within the institution.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="lg" variant="primary" onClick={() => router.push("/students/new")}>
            <UserPlus className="w-4 h-4" />
            학생 등록
          </Button>
        </div>
      </div>
      <section className="bg-surface-container-low p-6 rounded-xl border-l-[3px] border-primary flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface-variant text-base">학생 정보 안내</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            학생 목록에서는 학번, 소속 학과, 학년 등 필수 정보를 한눈에 확인할 수 있습니다. 상세
            조회를 원하시면 성명을 클릭하십시오. 개인정보 보호를 위해 휴대폰 번호와 이메일은 권한이
            있는 사용자에게만 노출됩니다.
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
      {/* 학생 데이터 테이블 임시 데이터임 (백엔드 API 연동 필요) */}
      <StudentsTable users={Array.isArray(students) ? students : []} />
      {/* 페이지네이션 */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(newPage) => fetchStudents({ page: newPage, limit: itemsPerPage, name: debouncedQuery || undefined })}
      />
    </div>
  );
};

export default Students;

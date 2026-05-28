"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "../../../store";
import StudentsTable from "./component/studentsTable";
import Pagination from "../../../components/pagination/Pagination";
import StudentRegistrationModal from "./component/StudentRegistrationModal";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import Button from "@/components/ui/Button/Button";

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
      <PageHeader
        label="관리"
        title="학생 관리"
        description="등록된 학생 목록을 조회하고 상세 정보를 확인합니다."
        actions={
          <Button
            variant="primary"
            radius="lg"
            onClick={() => router.push("/students/new")}
          >
            <UserPlus className="w-4 h-4" />
            학생 등록
          </Button>
        }
      />

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
        <div className="ml-auto">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="학생 이름 검색"
          />
        </div>
      </div>

      {/* Table */}
      <SectionCard
        icon={<Users className="w-5 h-5" />}
        title="학생 목록"
        badge={`총 ${pagination.total.toLocaleString()}명`}
      >
        <StudentsTable users={Array.isArray(students) ? students : []} />
      </SectionCard>

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

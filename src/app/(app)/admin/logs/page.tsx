"use client";

import { useState, useEffect, useCallback } from "react";
import { ScrollText, RefreshCw, Filter, Trash2, ChevronDown } from "lucide-react";
import api from "@/lib/axiosInstance";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { Alert } from "@/components/ui/Alert/Alert";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Dropdown } from "@/components/ui/Dropdown/Dropdown";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";
import Pagination from "@/components/pagination/Pagination";

interface LogEntry {
  _id: string;
  userId: string | null;
  username: string;
  role: string;
  method: string;
  path: string;
  statusCode: number;
  ip: string;
  createdAt: string;
}

interface LogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type FilterMethod = "ALL" | "GET" | "POST" | "PUT" | "DELETE";
type FilterStatus = "ALL" | "2xx" | "4xx" | "5xx";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700",
  POST: "bg-emerald-100 text-emerald-700",
  PUT: "bg-amber-100 text-amber-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  instructor: "bg-blue-100 text-blue-700",
  user: "bg-slate-100 text-slate-600",
  unknown: "bg-slate-100 text-slate-400",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "관리자",
  instructor: "강사",
  user: "학생",
  unknown: "비로그인",
};

const getStatusColor = (code: number) => {
  if (code >= 200 && code < 300) return "text-emerald-600 font-semibold";
  if (code >= 400 && code < 500) return "text-amber-600 font-semibold";
  if (code >= 500) return "text-danger font-semibold";
  return "text-muted";
};

const getActionLabel = (method: string, path: string) => {
  const p = path.toLowerCase();
  if (p.includes("/auth/signin")) return "로그인";
  if (p.includes("/auth/signup")) return "회원가입";
  if (p.includes("/students/link")) return "학부모-학생 연결";
  if (p.includes("/students") && method === "GET") return "학생 조회";
  if (p.includes("/payments") && method === "POST") return "결제 등록";
  if (p.includes("/payments") && method === "GET") return "결제 조회";
  if (p.includes("/classrooms") && method === "POST") return "강의실 생성";
  if (p.includes("/classrooms") && method === "PUT") return "강의실 수정";
  if (p.includes("/classrooms") && method === "DELETE") return "강의실 삭제";
  if (p.includes("/classrooms") && method === "GET") return "강의실 조회";
  if (p.includes("/subject") && method === "POST") return "과목 생성";
  if (p.includes("/subject") && method === "PUT") return "과목 수정";
  if (p.includes("/subject") && method === "DELETE") return "과목 삭제";
  if (p.includes("/admin/users") && method === "PUT") return "유저 정보 수정";
  if (p.includes("/admin/users") && method === "DELETE") return "유저 삭제";
  if (p.includes("/admin/users") && method === "GET") return "유저 목록 조회";
  if (p.includes("/calendar") && method === "POST") return "일정 등록";
  if (p.includes("/calendar") && method === "DELETE") return "일정 삭제";
  if (p.includes("/user/me") && method === "PUT") return "프로필 수정";
  return `${method} ${path}`;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState<LogPagination>({
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filterMethod, setFilterMethod] = useState<FilterMethod>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedUsername(usernameSearch), 400);
    return () => clearTimeout(t);
  }, [usernameSearch]);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "30",
        };
        if (filterMethod !== "ALL") params.method = filterMethod;
        if (filterStatus !== "ALL") params.status = filterStatus;
        if (filterRole !== "ALL") params.role = filterRole;
        if (debouncedUsername) params.username = debouncedUsername;

        const res = await api.get<{ logs: LogEntry[]; pagination: LogPagination }>("/logs", {
          params,
        });
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "로그를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [filterMethod, filterStatus, filterRole, debouncedUsername],
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleDeleteLogs = async (params: Record<string, string>) => {
    setIsDeleting(true);
    try {
      await api.delete("/logs", { params });
      fetchLogs(1);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("로그 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto w-full p-6">
      <PageHeader
        label="Admin"
        title="웹 로그"
        description="DB에 저장된 API 요청 이력을 확인합니다. (90일 보관)"
        actions={
          <>
            <Button
              variant="outline"
              radius="lg"
              onClick={() => fetchLogs(pagination.page)}
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
            <Dropdown
              trigger={
                <button
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-danger text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  로그 삭제
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              }
              items={[
                {
                  label: "전체 삭제",
                  onClick: () => handleDeleteLogs({ all: "true" }),
                  variant: "danger",
                },
                {
                  label: "7일 이전 로그 삭제",
                  onClick: () => {
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    handleDeleteLogs({ before: d.toISOString() });
                  },
                },
                {
                  label: "30일 이전 로그 삭제",
                  onClick: () => {
                    const d = new Date();
                    d.setDate(d.getDate() - 30);
                    handleDeleteLogs({ before: d.toISOString() });
                  },
                },
                {
                  label: "GET 요청만 삭제",
                  onClick: () => handleDeleteLogs({ method: "GET" }),
                },
              ]}
            />
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-paper rounded-xl border border-border">
        <div className="flex items-center gap-2 text-sm text-muted font-medium shrink-0">
          <Filter className="w-4 h-4" />
          필터
        </div>
        <div className="h-4 w-px bg-border" />

        {/* Method */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium">메서드</span>
          {(["ALL", "GET", "POST", "PUT", "DELETE"] as FilterMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMethod(m)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterMethod === m ? "bg-primary text-white" : "bg-border/50 text-muted hover:bg-border"
              }`}
            >
              {m === "ALL" ? "전체" : m}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium">상태</span>
          {(["ALL", "2xx", "4xx", "5xx"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterStatus === s ? "bg-primary text-white" : "bg-border/50 text-muted hover:bg-border"
              }`}
            >
              {s === "ALL" ? "전체" : s}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Role */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium">역할</span>
          {["ALL", "admin", "instructor", "user", "unknown"].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                filterRole === r ? "bg-primary text-white" : "bg-border/50 text-muted hover:bg-border"
              }`}
            >
              {r === "ALL" ? "전체" : ROLE_LABELS[r] ?? r}
            </button>
          ))}
        </div>

        {/* Username search */}
        <div className="ml-auto">
          <SearchInput
            value={usernameSearch}
            onChange={(e) => setUsernameSearch(e.target.value)}
            placeholder="유저명 검색"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <SectionCard
        icon={<ScrollText className="w-5 h-5" />}
        title="요청 이력"
        badge={`총 ${pagination.total.toLocaleString()}건`}
      >
        {isLoading ? (
          <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <ScrollText className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">조건에 맞는 로그가 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <Th className="whitespace-nowrap">시간</Th>
                <Th>행위자</Th>
                <Th>작업</Th>
                <Th>메서드</Th>
                <Th>경로</Th>
                <Th>상태</Th>
                <Th className="hidden xl:table-cell">IP</Th>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log._id}
                    variant={
                      log.statusCode >= 500
                        ? "danger"
                        : log.statusCode >= 400
                        ? "warning"
                        : "default"
                    }
                  >
                    <Td className="text-muted text-xs font-mono whitespace-nowrap">
                      {formatTime(log.createdAt)}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          {log.username === "anonymous" ? (
                            <span className="text-muted italic">비로그인</span>
                          ) : (
                            log.username
                          )}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-semibold ${ROLE_COLORS[log.role] ?? "bg-slate-100 text-slate-500"}`}
                        >
                          {ROLE_LABELS[log.role] ?? log.role}
                        </span>
                      </div>
                    </Td>
                    <Td className="text-xs text-ink font-medium whitespace-nowrap">
                      {getActionLabel(log.method, log.path)}
                    </Td>
                    <Td>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${METHOD_COLORS[log.method] ?? "bg-slate-100 text-slate-600"}`}
                      >
                        {log.method}
                      </span>
                    </Td>
                    <Td className="text-xs text-muted font-mono max-w-50 truncate" title={log.path}>
                      {log.path}
                    </Td>
                    <Td className={`text-xs ${getStatusColor(log.statusCode)}`}>
                      {log.statusCode}
                    </Td>
                    <Td className="text-xs text-muted font-mono hidden xl:table-cell">
                      {log.ip}
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={fetchLogs}
        />
      )}
    </div>
  );
}

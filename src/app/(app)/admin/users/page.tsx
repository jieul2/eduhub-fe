"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, RefreshCw, Pencil, Trash2, X,
  User, Shield, GraduationCap, BookOpen, Link2,
  UserCheck, ChevronDown, ChevronUp, Plus,
} from "lucide-react";
import api from "@/lib/axiosInstance";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { Alert } from "@/components/ui/Alert/Alert";
import { Badge } from "@/components/ui/Badge/Badge";
import { Modal } from "@/components/ui/Modal/Modal";
import { SearchInput } from "@/components/ui/SearchInput/SearchInput";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";
import Pagination from "@/components/pagination/Pagination";

type Tab = "all" | "parents";

interface UserItem {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: "admin" | "instructor" | "user";
  status: "active" | "inactive";
  gender?: "male" | "female";
  birthDate?: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LinkedStudent {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  status: string;
}

interface ParentItem extends UserItem {
  students: LinkedStudent[];
}

const ROLE_CONFIG = {
  admin: { label: "관리자", icon: Shield, color: "bg-purple-100 text-purple-700" },
  instructor: { label: "강사", icon: BookOpen, color: "bg-blue-100 text-blue-700" },
  user: { label: "학생", icon: GraduationCap, color: "bg-emerald-100 text-emerald-700" },
};

const ROLE_BADGE_VARIANT = {
  admin: "admin" as const,
  instructor: "info" as const,
  user: "success" as const,
};

const FIELD_CLASS =
  "w-full border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-paper";

const LABEL_CLASS = "block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5";

interface EditModalProps {
  user: UserItem;
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ user, onClose, onSaved }: EditModalProps) {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    phone: user.phone ?? "",
    role: user.role,
    status: user.status,
    gender: user.gender ?? "",
    birthDate: user.birthDate ? user.birthDate.slice(0, 10) : "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = {};
      if (form.username) payload.username = form.username;
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (form.role) payload.role = form.role;
      if (form.status) payload.status = form.status;
      if (form.gender) payload.gender = form.gender;
      if (form.birthDate) payload.birthDate = form.birthDate;
      if (form.password) payload.password = form.password;

      await api.put(`/admin/users/${user._id}`, payload);
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "업데이트에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleIcon = ROLE_CONFIG[user.role].icon;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="유저 정보 수정"
      subtitle={user.email}
      icon={<RoleIcon className="w-5 h-5 text-primary" />}
      footer={
        <>
          <Button variant="outline" radius="xl" size="lg" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="primary"
            radius="xl"
            size="lg"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSave}
          >
            저장
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "이름", key: "username", type: "text" },
          { label: "이메일", key: "email", type: "email" },
          { label: "전화번호", key: "phone", type: "text", placeholder: "010-0000-0000" },
          { label: "생년월일", key: "birthDate", type: "date" },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className={LABEL_CLASS}>{label}</label>
            <input
              type={type}
              className={FIELD_CLASS}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div>
          <label className={LABEL_CLASS}>역할</label>
          <select
            className={FIELD_CLASS}
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserItem["role"] })}
          >
            <option value="user">학생</option>
            <option value="instructor">강사</option>
            <option value="admin">관리자</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>상태</label>
          <select
            className={FIELD_CLASS}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as UserItem["status"] })}
          >
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>성별</label>
          <select
            className={FIELD_CLASS}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="">선택 안함</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>
            새 비밀번호 <span className="text-muted font-normal normal-case">(선택)</span>
          </label>
          <input
            type="password"
            className={FIELD_CLASS}
            placeholder="변경 시에만 입력"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
      </div>
      {error && (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
    </Modal>
  );
}

export default function UsersPage() {
  const [tab, setTab] = useState<Tab>("all");

  const [users, setUsers] = useState<UserItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [nameSearch, setNameSearch] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  const [parents, setParents] = useState<ParentItem[]>([]);
  const [isParentLoading, setIsParentLoading] = useState(false);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [allUsersList, setAllUsersList] = useState<UserItem[]>([]);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedName(nameSearch), 300);
    return () => clearTimeout(t);
  }, [nameSearch]);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = { page: String(page), limit: "10" };
        if (roleFilter !== "ALL") params.role = roleFilter;
        if (debouncedName) params.name = debouncedName;
        const res = await api.get<{ users: UserItem[]; pagination: PaginationData }>("/admin/users", { params });
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } catch (e: any) {
        setError(e?.response?.data?.message ?? "유저 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [roleFilter, debouncedName],
  );

  const fetchParents = useCallback(async () => {
    setIsParentLoading(true);
    try {
      const res = await api.get<{ parents: ParentItem[] }>("/parents");
      setParents(res.data.parents);
    } catch {
      setError("학부모 목록을 불러오지 못했습니다.");
    } finally {
      setIsParentLoading(false);
    }
  }, []);

  useEffect(() => { if (tab === "all") fetchUsers(1); }, [tab, fetchUsers]);
  useEffect(() => { if (tab === "parents") fetchParents(); }, [tab, fetchParents]);

  const handleDelete = async (userId: string) => {
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${userId}`);
      setDeleteConfirmId(null);
      fetchUsers(pagination.page);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openLinkModal = async () => {
    setLinkError(null);
    setLinkSuccess(null);
    setSelectedParentId("");
    setSelectedStudentId("");
    try {
      const res = await api.get<{ users: UserItem[] }>("/admin/users", { params: { limit: 200 } });
      setAllUsersList(res.data.users);
    } catch { /* silent */ }
    setIsLinkModalOpen(true);
  };

  const handleLink = async () => {
    if (!selectedParentId || !selectedStudentId) {
      setLinkError("학부모와 학생을 모두 선택해주세요.");
      return;
    }
    setIsLinking(true);
    setLinkError(null);
    try {
      await api.post("/students/link", { parentId: selectedParentId, studentId: selectedStudentId });
      setLinkSuccess("연결 완료!");
      fetchParents();
      setTimeout(() => { setIsLinkModalOpen(false); setLinkSuccess(null); }, 1200);
    } catch (e: any) {
      setLinkError(e?.response?.data?.message ?? "연결에 실패했습니다.");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-6xl mx-auto w-full p-6">
      <PageHeader
        label="Admin"
        title="유저 관리"
        description="전체 유저 조회, 정보 수정 및 학부모-학생 연결을 관리합니다."
        actions={
          <>
            <Button
              variant="outline"
              radius="lg"
              onClick={() => tab === "all" ? fetchUsers(pagination.page) : fetchParents()}
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
            {tab === "parents" && (
              <Button variant="primary" radius="lg" onClick={openLinkModal}>
                <Link2 className="w-4 h-4" />
                연결 추가
              </Button>
            )}
          </>
        }
      />

      {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}

      {/* Tabs */}
      <div className="flex gap-1 bg-paper border border-border p-1 rounded-xl w-fit">
        {([
          { id: "all" as Tab, label: "전체 유저", icon: Users },
          { id: "parents" as Tab, label: "학부모 연결", icon: UserCheck },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === id ? "bg-primary text-white shadow-sm" : "text-muted hover:text-ink hover:bg-border/40"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── All Users Tab ─── */}
      {tab === "all" && (
        <div className="flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-paper rounded-xl border border-border">
            <div className="flex items-center gap-2 flex-wrap">
              {(["ALL", "admin", "instructor", "user"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    roleFilter === r ? "bg-primary text-white" : "bg-border/50 text-muted hover:bg-border"
                  }`}
                >
                  {r === "ALL" ? "전체" : ROLE_CONFIG[r].label}
                </button>
              ))}
              <span className="text-sm text-muted ml-2">
                총 <span className="font-bold text-ink">{pagination.total}</span>명
              </span>
            </div>
            <SearchInput
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              placeholder="이름 검색"
              width="w-52"
            />
          </div>

          <SectionCard
            icon={<Users className="w-5 h-5" />}
            title="유저 목록"
            badge={`${pagination.total}명`}
          >
            {isLoading ? (
              <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <Users className="w-10 h-10 text-border mx-auto mb-3" />
                <p className="text-muted text-sm">유저가 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHead>
                  <Th>유저</Th>
                  <Th className="hidden sm:table-cell">이메일</Th>
                  <Th>역할</Th>
                  <Th>상태</Th>
                  <Th className="hidden lg:table-cell">전화번호</Th>
                  <Th className="hidden xl:table-cell">등록일</Th>
                  <Th align="right">액션</Th>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const rc = ROLE_CONFIG[user.role];
                    const RoleIcon = rc.icon;
                    return (
                      <TableRow key={user._id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${rc.color}`}>
                              <RoleIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-semibold text-ink">{user.username}</p>
                              <p className="text-xs text-muted font-mono">{user._id.slice(-8)}</p>
                            </div>
                          </div>
                        </Td>
                        <Td className="text-muted text-sm hidden sm:table-cell">{user.email}</Td>
                        <Td>
                          <Badge variant={ROLE_BADGE_VARIANT[user.role]} rounded="full">{rc.label}</Badge>
                        </Td>
                        <Td>
                          <Badge
                            variant={user.status === "active" ? "success" : "neutral"}
                            rounded="full"
                          >
                            {user.status === "active" ? "활성" : "비활성"}
                          </Badge>
                        </Td>
                        <Td className="text-muted text-sm hidden lg:table-cell">{user.phone ?? "-"}</Td>
                        <Td className="text-muted text-sm hidden xl:table-cell">
                          {new Date(user.createdAt).toLocaleDateString("ko-KR")}
                        </Td>
                        <Td>
                          <div className="flex items-center justify-end gap-1.5">
                            {deleteConfirmId === user._id ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-danger font-medium">삭제?</span>
                                <button
                                  disabled={isDeleting}
                                  onClick={() => handleDelete(user._id)}
                                  className="px-2.5 py-1 rounded-md bg-danger text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                                >
                                  확인
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 rounded-md bg-border/60 text-muted text-xs font-semibold transition-colors"
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setEditingUser(user)}
                                  className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(user._id)}
                                  className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </Td>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </SectionCard>

          {pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={fetchUsers}
            />
          )}
        </div>
      )}

      {/* ─── Parents Tab ─── */}
      {tab === "parents" && (
        <div className="flex flex-col gap-4">
          <SectionCard
            icon={<UserCheck className="w-5 h-5" />}
            title="학부모 목록"
            badge={`${parents.length}명`}
            headerRight={
              <Button variant="ghost" size="sm" radius="lg" onClick={openLinkModal}>
                <Plus className="w-3.5 h-3.5" />
                연결 추가
              </Button>
            }
          >
            {isParentLoading ? (
              <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
            ) : parents.length === 0 ? (
              <div className="py-20 text-center">
                <UserCheck className="w-10 h-10 text-border mx-auto mb-3" />
                <p className="text-muted text-sm">연결된 학부모가 없습니다.</p>
                <Button variant="primary" radius="xl" size="lg" className="mt-4 mx-auto" onClick={openLinkModal}>
                  <Link2 className="w-4 h-4" />
                  첫 번째 연결 추가
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {parents.map((parent) => (
                  <div key={parent._id}>
                    <button
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-border/10 transition-colors text-left"
                      onClick={() => setExpandedParent(expandedParent === parent._id ? null : parent._id)}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-ink text-sm">{parent.username}</p>
                        <p className="text-xs text-muted truncate">{parent.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={parent.status === "active" ? "success" : "neutral"} rounded="full">
                          {parent.status === "active" ? "활성" : "비활성"}
                        </Badge>
                        <Badge variant="count" rounded="full">자녀 {parent.students.length}명</Badge>
                        {expandedParent === parent._id ? (
                          <ChevronUp className="w-4 h-4 text-muted" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted" />
                        )}
                      </div>
                    </button>

                    {expandedParent === parent._id && (
                      <div className="px-6 pb-5 bg-border/5">
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 pt-2">
                          연결된 학생
                        </p>
                        {parent.students.length === 0 ? (
                          <p className="text-sm text-muted">연결된 학생이 없습니다.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {parent.students.map((student) => (
                              <div
                                key={student._id}
                                className="flex items-center gap-3 bg-background rounded-xl border border-border p-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-ink truncate">{student.username}</p>
                                  <p className="text-xs text-muted truncate">{student.email}</p>
                                </div>
                                <Badge variant={student.status === "active" ? "success" : "neutral"} rounded="full">
                                  {student.status === "active" ? "활성" : "비활성"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <EditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => fetchUsers(pagination.page)}
        />
      )}

      {/* Link Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="학부모-학생 연결"
        icon={<Link2 className="w-5 h-5 text-primary" />}
        footer={
          <>
            <Button variant="outline" radius="xl" size="lg" onClick={() => setIsLinkModalOpen(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              radius="xl"
              size="lg"
              isLoading={isLinking}
              disabled={isLinking || !selectedParentId || !selectedStudentId}
              onClick={handleLink}
            >
              연결하기
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              학부모 선택 <span className="text-danger">*</span>
            </label>
            <select
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-paper"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
            >
              <option value="">-- 학부모를 선택하세요 --</option>
              {allUsersList.map((u) => (
                <option key={u._id} value={u._id}>
                  [{ROLE_CONFIG[u.role]?.label ?? u.role}] {u.username} ({u.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              학생 선택 <span className="text-danger">*</span>
            </label>
            <select
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-paper"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- 학생을 선택하세요 --</option>
              {allUsersList
                .filter((u) => u._id !== selectedParentId)
                .map((u) => (
                  <option key={u._id} value={u._id}>
                    [{ROLE_CONFIG[u.role]?.label ?? u.role}] {u.username} ({u.email})
                  </option>
                ))}
            </select>
          </div>
          {linkError && <Alert variant="error">{linkError}</Alert>}
          {linkSuccess && <Alert variant="success">{linkSuccess}</Alert>}
        </div>
      </Modal>
    </div>
  );
}

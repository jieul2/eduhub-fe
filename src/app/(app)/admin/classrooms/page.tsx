"use client";

import { useState, useEffect, useCallback } from "react";
import { Building2, Plus, Pencil, Trash2, Check, X, RefreshCw } from "lucide-react";
import api from "@/lib/axiosInstance";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { Alert } from "@/components/ui/Alert/Alert";
import { Modal } from "@/components/ui/Modal/Modal";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";

interface Classroom {
  _id: string;
  classroomName: string;
  createdAt: string;
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [createValue, setCreateValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClassrooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ classrooms: Classroom[] }>("/classrooms");
      setClassrooms(res.data.classrooms);
    } catch {
      setError("강의실 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleCreate = async () => {
    if (!createValue.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/classrooms", { classroomName: createValue.trim() });
      setCreateValue("");
      setIsModalOpen(false);
      fetchClassrooms();
    } catch {
      setError("강의실 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    setIsSubmitting(true);
    try {
      await api.put(`/classrooms/${id}`, { classroomName: editValue.trim() });
      setEditingId(null);
      setEditValue("");
      fetchClassrooms();
    } catch {
      setError("강의실 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.delete(`/classrooms/${id}`);
      setDeleteConfirmId(null);
      fetchClassrooms();
    } catch {
      setError("강의실 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (room: Classroom) => {
    setEditingId(room._id);
    setEditValue(room.classroomName);
    setDeleteConfirmId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto w-full p-6">
      <PageHeader
        label="Admin"
        title="강의실 관리"
        description="강의실 정보를 추가, 수정, 삭제합니다."
        actions={
          <>
            <Button variant="outline" radius="lg" onClick={fetchClassrooms}>
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
            <Button
              variant="primary"
              radius="lg"
              onClick={() => { setIsModalOpen(true); setCreateValue(""); }}
            >
              <Plus className="w-4 h-4" />
              강의실 추가
            </Button>
          </>
        }
      />

      {/* Error Banner */}
      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Table Card */}
      <SectionCard
        icon={<Building2 className="w-5 h-5" />}
        title="강의실 목록"
        badge={`${classrooms.length}개`}
      >
        {isLoading ? (
          <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
        ) : classrooms.length === 0 ? (
          <div className="py-20 text-center">
            <Building2 className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">등록된 강의실이 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <Th className="w-12">#</Th>
              <Th>강의실 이름</Th>
              <Th className="hidden sm:table-cell">등록일</Th>
              <Th align="right">액션</Th>
            </TableHead>
            <TableBody>
              {classrooms.map((room, idx) => (
                <TableRow key={room._id}>
                  <Td className="text-muted font-mono text-xs">{idx + 1}</Td>
                  <Td>
                    {editingId === room._id ? (
                      <input
                        autoFocus
                        className="border border-primary/40 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(room._id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <span className="font-medium text-ink">{room.classroomName}</span>
                    )}
                  </Td>
                  <Td className="text-muted hidden sm:table-cell">
                    {new Date(room.createdAt).toLocaleDateString("ko-KR")}
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      {editingId === room._id ? (
                        <>
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleUpdate(room._id)}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-md text-muted hover:bg-border/50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : deleteConfirmId === room._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-danger font-medium">삭제하시겠습니까?</span>
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleDelete(room._id)}
                            className="px-2.5 py-1 rounded-md bg-danger text-white text-xs font-semibold hover:bg-red-600 transition-colors"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2.5 py-1 rounded-md bg-border/60 text-muted text-xs font-semibold hover:bg-border transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(room)}
                            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteConfirmId(room._id); setEditingId(null); }}
                            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </Td>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="강의실 추가"
        maxWidth="max-w-md"
        icon={<Building2 className="w-5 h-5 text-primary" />}
        footer={
          <>
            <Button variant="ghost" radius="lg" onClick={() => setIsModalOpen(false)}>
              취소
            </Button>
            <Button
              variant="primary"
              radius="lg"
              disabled={isSubmitting || !createValue.trim()}
              isLoading={isSubmitting}
              onClick={handleCreate}
            >
              추가
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-ink mb-2">
          강의실 이름 <span className="text-danger">*</span>
        </label>
        <input
          autoFocus
          className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-paper"
          placeholder="예) 1강의실, A강의실, 세미나실"
          value={createValue}
          onChange={(e) => setCreateValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
            if (e.key === "Escape") setIsModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import api from "@/lib/axiosInstance";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { SectionCard } from "@/components/SectionCard/SectionCard";
import { Alert } from "@/components/ui/Alert/Alert";
import { Modal } from "@/components/ui/Modal/Modal";
import { Table, TableHead, TableBody, TableRow, Th, Td } from "@/components/ui/Table/Table";
import Button from "@/components/ui/Button/Button";

interface Subject {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ subjects: Subject[] }>("/subject");
      setSubjects(res.data.subjects);
    } catch {
      setError("과목 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  const handleCreate = async () => {
    if (!createTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/subject", { title: createTitle.trim(), description: createDesc.trim() });
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateDesc("");
      fetchSubjects();
    } catch {
      setError("과목 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditTitle(subject.title);
    setEditDesc(subject.description ?? "");
    setIsEditOpen(true);
    setDeleteConfirmId(null);
  };

  const handleUpdate = async () => {
    if (!editingSubject || !editTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await api.put(`/subject/${editingSubject._id}`, {
        title: editTitle.trim(),
        description: editDesc.trim(),
      });
      setIsEditOpen(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch {
      setError("과목 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsSubmitting(true);
    try {
      await api.delete(`/subject/${id}`);
      setDeleteConfirmId(null);
      fetchSubjects();
    } catch {
      setError("과목 삭제에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto w-full p-6">
      <PageHeader
        label="Admin"
        title="과목 관리"
        description="수업에 사용되는 과목을 추가, 수정, 삭제합니다."
        actions={
          <>
            <Button variant="outline" radius="lg" onClick={fetchSubjects}>
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
            <Button
              variant="primary"
              radius="lg"
              onClick={() => { setIsCreateOpen(true); setCreateTitle(""); setCreateDesc(""); }}
            >
              <Plus className="w-4 h-4" />
              과목 추가
            </Button>
          </>
        }
      />

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <SectionCard
        icon={<BookOpen className="w-5 h-5" />}
        title="과목 목록"
        badge={`${subjects.length}개`}
      >
        {isLoading ? (
          <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
        ) : subjects.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">등록된 과목이 없습니다.</p>
          </div>
        ) : (
          <Table>
            <TableHead>
              <Th className="w-10">#</Th>
              <Th>과목</Th>
              <Th className="hidden sm:table-cell">등록일</Th>
              <Th align="right" className="w-28">액션</Th>
            </TableHead>
            <TableBody>
              {subjects.map((subject, idx) => (
                <TableRow key={subject._id}>
                  <Td className="text-muted font-mono text-xs">{idx + 1}</Td>
                  <Td>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                        <span className="font-medium text-ink truncate">{subject.title}</span>
                      </div>
                      {subject.description && (
                        <span className="text-xs text-muted line-clamp-1 pl-4">{subject.description}</span>
                      )}
                    </div>
                  </Td>
                  <Td className="text-muted hidden sm:table-cell whitespace-nowrap">
                    {new Date(subject.createdAt).toLocaleDateString("ko-KR")}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {deleteConfirmId === subject._id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-danger font-medium whitespace-nowrap">삭제할까요?</span>
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleDelete(subject._id)}
                            className="px-2 py-1 rounded-md bg-danger text-white text-xs font-semibold hover:bg-red-600 transition-colors shrink-0"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-md bg-border/60 text-muted text-xs font-semibold hover:bg-border transition-colors shrink-0"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => openEdit(subject)}
                            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteConfirmId(subject._id); }}
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
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="과목 추가"
        maxWidth="max-w-md"
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        footer={
          <>
            <Button variant="ghost" radius="lg" onClick={() => setIsCreateOpen(false)}>취소</Button>
            <Button
              variant="primary"
              radius="lg"
              disabled={isSubmitting || !createTitle.trim()}
              isLoading={isSubmitting}
              onClick={handleCreate}
            >
              추가
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              과목명 <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-paper"
              placeholder="예) 수학, 영어, 국어, 과학"
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setIsCreateOpen(false); }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">설명 <span className="text-muted text-xs">(선택)</span></label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-paper resize-none"
              placeholder="과목에 대한 부가 설명을 입력하세요"
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditingSubject(null); }}
        title="과목 수정"
        maxWidth="max-w-md"
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        footer={
          <>
            <Button variant="ghost" radius="lg" onClick={() => { setIsEditOpen(false); setEditingSubject(null); }}>취소</Button>
            <Button
              variant="primary"
              radius="lg"
              disabled={isSubmitting || !editTitle.trim()}
              isLoading={isSubmitting}
              onClick={handleUpdate}
            >
              저장
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              과목명 <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-paper"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(); }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">설명 <span className="text-muted text-xs">(선택)</span></label>
            <textarea
              rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-paper resize-none"
              placeholder="과목에 대한 부가 설명을 입력하세요"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

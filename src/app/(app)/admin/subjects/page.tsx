"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Pencil, Trash2, Check, X, RefreshCw } from "lucide-react";
import api from "@/lib/axiosInstance";

interface Subject {
  _id: string;
  title: string;
  createdAt: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [createValue, setCreateValue] = useState("");
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

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleCreate = async () => {
    if (!createValue.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/subject", { title: createValue.trim() });
      setCreateValue("");
      setIsModalOpen(false);
      fetchSubjects();
    } catch {
      setError("과목 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;
    setIsSubmitting(true);
    try {
      await api.put(`/subject/${id}`, { title: editValue.trim() });
      setEditingId(null);
      setEditValue("");
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

  const startEdit = (subject: Subject) => {
    setEditingId(subject._id);
    setEditValue(subject.title);
    setDeleteConfirmId(null);
  };

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto w-full p-6">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin</span>
          <h1 className="text-3xl font-bold text-ink tracking-tight">과목 관리</h1>
          <p className="text-sm text-muted">수업에 사용되는 과목을 추가, 수정, 삭제합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubjects}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-muted text-sm font-medium hover:bg-border/40 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새로고침
          </button>
          <button
            onClick={() => { setIsModalOpen(true); setCreateValue(""); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            과목 추가
          </button>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <X className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-paper rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-semibold text-ink text-sm">과목 목록</span>
            <span className="text-xs font-medium text-muted bg-border/60 px-2.5 py-0.5 rounded-full">
              {subjects.length}개
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-muted text-sm">불러오는 중...</div>
        ) : subjects.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-muted text-sm">등록된 과목이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted uppercase bg-border/20">
                <th className="text-left px-6 py-3 font-semibold w-12">#</th>
                <th className="text-left px-6 py-3 font-semibold">과목명</th>
                <th className="text-left px-6 py-3 font-semibold hidden sm:table-cell">등록일</th>
                <th className="text-right px-6 py-3 font-semibold">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subjects.map((subject, idx) => (
                <tr key={subject._id} className="hover:bg-border/10 transition-colors group">
                  <td className="px-6 py-4 text-muted font-mono text-xs">{idx + 1}</td>
                  <td className="px-6 py-4">
                    {editingId === subject._id ? (
                      <input
                        autoFocus
                        className="border border-primary/40 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdate(subject._id);
                          if (e.key === "Escape") { setEditingId(null); setEditValue(""); }
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                        <span className="font-medium text-ink">{subject.title}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted hidden sm:table-cell">
                    {new Date(subject.createdAt).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {editingId === subject._id ? (
                        <>
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleUpdate(subject._id)}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditValue(""); }}
                            className="p-1.5 rounded-md text-muted hover:bg-border/50 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : deleteConfirmId === subject._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-danger font-medium">삭제하시겠습니까?</span>
                          <button
                            disabled={isSubmitting}
                            onClick={() => handleDelete(subject._id)}
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
                            onClick={() => startEdit(subject)}
                            className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeleteConfirmId(subject._id); setEditingId(null); }}
                            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-2xl border border-border p-8 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-ink">과목 추가</h2>
            </div>
            <label className="block text-sm font-medium text-ink mb-2">
              과목명 <span className="text-danger">*</span>
            </label>
            <input
              autoFocus
              className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-paper"
              placeholder="예) 수학, 영어, 국어, 과학"
              value={createValue}
              onChange={(e) => setCreateValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsModalOpen(false);
              }}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-muted hover:bg-border/50 transition-colors"
              >
                취소
              </button>
              <button
                disabled={isSubmitting || !createValue.trim()}
                onClick={handleCreate}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

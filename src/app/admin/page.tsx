"use client";

import { CheckCircle2, CreditCard, LogIn, Search, SendHorizontal, UserPlus, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type AuthMode = "signin" | "signup";

interface SigninForm {
  email: string;
  password: string;
}

interface SignupForm {
  username: string;
  email: string;
  password: string;
  role: "admin" | "instructor" | "user";
  phone: string;
  birthDate: string;
  gender: "male" | "female";
}

interface AuthErrorPayload {
  message?: string;
  error?: string;
}

interface StudentItem {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  gender?: string;
  status: string;
}

interface StudentListResponse {
  students: StudentItem[];
  pagination: { total: number; totalPages: number; page: number; limit: number };
}

type PaymentStep = "select-student" | "enter-amount";

const initialSigninForm: SigninForm = {
  email: "",
  password: "",
};

const initialSignupForm: SignupForm = {
  username: "",
  email: "",
  password: "",
  role: "admin",
  phone: "",
  birthDate: "",
  gender: "male",
};

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";
};

const getErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as AuthErrorPayload;
    return data?.error || data?.message || "요청 처리 중 오류가 발생했습니다.";
  } catch {
    return "요청 처리 중 오류가 발생했습니다.";
  }
};

const requestSignin = async (payload: SigninForm) => {
  const response = await fetch(`${getApiBaseUrl()}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<{ token: string; message?: string }>;
};

const requestSignup = async (payload: SignupForm) => {
  const response = await fetch(`${getApiBaseUrl()}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<{ message?: string }>;
};

export default function AdminAuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [signinForm, setSigninForm] = useState<SigninForm>(initialSigninForm);
  const [signupForm, setSignupForm] = useState<SignupForm>(initialSignupForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 결제 생성 상태
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("select-student");
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentTotalPages, setStudentTotalPages] = useState(1);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const submitLabel = useMemo(() => {
    return mode === "signin" ? "로그인" : "회원가입";
  }, [mode]);

  const submitButtonClassName = useMemo(() => {
    return mode === "signin" ? "bg-slate-900 hover:bg-black" : "bg-emerald-700 hover:bg-emerald-800";
  }, [mode]);

  const fetchStudents = useCallback(async (search: string, page: number) => {
    try {
      setIsStudentsLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: "8" });
      if (search) params.set("name", search);
      const res = await fetch(`${getApiBaseUrl()}/students?${params.toString()}`);
      if (!res.ok) throw new Error("학생 목록을 불러오지 못했습니다.");
      const data = (await res.json()) as StudentListResponse;
      setStudents(data.students);
      setStudentTotalPages(data.pagination.totalPages);
    } catch {
      setStudents([]);
    } finally {
      setIsStudentsLoading(false);
    }
  }, []);

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
    setPaymentStep("select-student");
    setSelectedStudent(null);
    setPaymentAmount("");
    setPaymentError(null);
    setPaymentSuccess(false);
    setStudentSearch("");
    setStudentPage(1);
    fetchStudents("", 1);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleStudentSearchChange = (value: string) => {
    setStudentSearch(value);
    setStudentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchStudents(value, 1);
    }, 350);
  };

  const handleStudentPageChange = (page: number) => {
    setStudentPage(page);
    fetchStudents(studentSearch, page);
  };

  const handleSelectStudent = (student: StudentItem) => {
    setSelectedStudent(student);
    setPaymentStep("enter-amount");
    setPaymentError(null);
  };

  const handleCreatePayment = async () => {
    if (!selectedStudent) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setPaymentError("올바른 금액을 입력해 주세요.");
      return;
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;
    if (!token) {
      setPaymentError("로그인 후 이용해 주세요. (auth-token 없음)");
      return;
    }
    try {
      setIsPaymentLoading(true);
      setPaymentError(null);
      const res = await fetch(`${getApiBaseUrl()}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: selectedStudent._id, amount }),
      });
      if (!res.ok) {
        const errData = (await res.json()) as AuthErrorPayload;
        throw new Error(errData.error ?? errData.message ?? "결제 생성에 실패했습니다.");
      }
      setPaymentSuccess(true);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "결제 생성에 실패했습니다.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const fillSignupFormRandomly = (role: SignupForm["role"]) => {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const randomNames = ["민수", "서연", "지훈", "하은", "도윤", "수빈", "가람", "은호"];
    const randomGenders: SignupForm["gender"][] = ["male", "female"];

    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    const gender = randomGenders[Math.floor(Math.random() * randomGenders.length)];

    const year = 1990 + Math.floor(Math.random() * 15);
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");

    if (role === "user") {
      setSignupForm({
        username: `테스트${name}${randomNumber}`,
        email: `user_${randomNumber}@test.com`,
        password: `user_${randomNumber}`,
        role,
        phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        birthDate: `${year}-${month}-${day}`,
        gender,
      });
    } else if (role === "admin") {
      setSignupForm({
        username: `어드민${name}${randomNumber}`,
        email: `admin_${randomNumber}@test.com`,
        password: `admin_${randomNumber}`,
        role,
        phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        birthDate: `${year}-${month}-${day}`,
        gender,
      });
    } else {
      setSignupForm({
        username: `강사${name}${randomNumber}`,
        email: `in_${randomNumber}@test.com`,
        password: `in_${randomNumber}`,
        role,
        phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        birthDate: `${year}-${month}-${day}`,
        gender,
      });
    }

    setError(null);
    setMessage(`회원가입 폼에 ${role} 랜덤 데이터가 입력되었습니다.`);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      if (mode === "signin") {
        const response = await requestSignin(signinForm);
        const token = response?.token;

        if (!token) {
          throw new Error("토큰이 응답에 없습니다.");
        }

        localStorage.setItem("auth-token", token);
        localStorage.setItem("auth-email", signinForm.email);
        setMessage("로그인 성공. auth-token 이 저장되었습니다.");
        return;
      }

      await requestSignup(signupForm);
      setMessage("회원가입 성공. 로그인 탭에서 바로 로그인할 수 있습니다.");
      setMode("signin");
      setSigninForm({ email: signupForm.email, password: "" });
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">

      {/* 결제 생성 모달 */}
      {isPaymentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closePaymentModal(); }}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">결제 생성</h2>
                  <p className="text-xs text-slate-500">
                    {paymentStep === "select-student" ? "결제할 학생을 선택하세요" : `${selectedStudent?.username} 학생 · 금액 입력`}
                  </p>
                </div>
              </div>
              <button
                onClick={closePaymentModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentSuccess ? (
              /* 성공 화면 */
              <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">결제 생성 완료</h3>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{selectedStudent?.username}</span> 학생에게{" "}
                  <span className="font-semibold text-slate-700">
                    {Number(paymentAmount).toLocaleString("ko-KR")}원
                  </span>{" "}
                  결제가 생성되었습니다.
                </p>
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setPaymentStep("select-student");
                      setSelectedStudent(null);
                      setPaymentAmount("");
                      setPaymentSuccess(false);
                      setStudentSearch("");
                      setStudentPage(1);
                      fetchStudents("", 1);
                    }}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    다시 생성
                  </button>
                  <button
                    onClick={closePaymentModal}
                    className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold  transition hover:bg-slate-700"
                  >
                    닫기
                  </button>
                </div>
              </div>
            ) : paymentStep === "select-student" ? (
              /* 학생 선택 단계 */
              <div className="px-6 py-5">
                {/* 검색 */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => handleStudentSearchChange(e.target.value)}
                    placeholder="학생 이름 검색..."
                    className="w-full rounded-xl border border-slate-300 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-400"
                  />
                </div>

                {/* 학생 테이블 */}
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">이름</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">이메일</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">연락처</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isStudentsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0">
                            {Array.from({ length: 4 }).map((__, j) => (
                              <td key={j} className="px-4 py-3">
                                <div className="h-4 animate-pulse rounded bg-slate-200" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            학생이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <tr
                            key={student._id}
                            onClick={() => handleSelectStudent(student)}
                            className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-blue-50"
                          >
                            <td className="px-4 py-3 font-semibold text-slate-900">{student.username}</td>
                            <td className="px-4 py-3 text-slate-500">{student.email}</td>
                            <td className="px-4 py-3 text-slate-500">{student.phone || "-"}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${student.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {student.status === "active" ? "활성" : "비활성"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {studentTotalPages > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {Array.from({ length: studentTotalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handleStudentPageChange(p)}
                        className={`h-7 w-7 rounded-lg text-xs font-semibold transition ${p === studentPage ? "bg-blue-600 " : "text-slate-500 hover:bg-slate-100"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* 금액 입력 단계 */
              <div className="px-6 py-5 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-sm font-bold">
                    {selectedStudent?.username[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{selectedStudent?.username}</p>
                    <p className="text-sm text-slate-500">{selectedStudent?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">결제 금액 (원)</label>
                  <input
                    type="number"
                    min={1}
                    value={paymentAmount}
                    onChange={(e) => { setPaymentAmount(e.target.value); setPaymentError(null); }}
                    placeholder="예: 150000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                    autoFocus
                  />
                  {paymentAmount && Number(paymentAmount) > 0 && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      {Number(paymentAmount).toLocaleString("ko-KR")}원
                    </p>
                  )}
                </div>

                {paymentError && (
                  <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{paymentError}</p>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setPaymentStep("select-student"); setPaymentError(null); }}
                    className="flex-1 rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={handleCreatePayment}
                    disabled={isPaymentLoading || !paymentAmount}
                    className="flex-1 rounded-xl bg-blue-700 py-3 text-sm font-bold  transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPaymentLoading ? "처리 중..." : "결제 생성"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl space-y-6">
        {/* 인증 카드 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] md:p-10">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-700">Temporary</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-900">
            Admin 인증 페이지
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            임시 테스트용 로그인/회원가입 페이지입니다. 로그인 성공 시 토큰이 localStorage에 저장됩니다.
          </p>
        </div>

        <div className="mb-2 text-xs font-semibold text-slate-500">인증 모드 선택</div>
        <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === "signin"
                ? "bg-white text-blue-700 shadow ring-1 ring-blue-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <LogIn className="h-4 w-4" />
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-blue-700 shadow ring-1 ring-blue-200"
                : "text-slate-600 hover:bg-white/60"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            회원가입
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === "signin" ? (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">이메일</label>
                <input
                  type="email"
                  required
                  value={signinForm.email}
                  onChange={(e) => setSigninForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  placeholder="admin@eduhub.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">비밀번호</label>
                <input
                  type="password"
                  required
                  value={signinForm.password}
                  onChange={(e) => setSigninForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  placeholder="비밀번호 입력"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => fillSignupFormRandomly("user")}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  유저 랜덤
                </button>
                <button
                  type="button"
                  onClick={() => fillSignupFormRandomly("instructor")}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  강사 랜덤
                </button>
                <button
                  type="button"
                  onClick={() => fillSignupFormRandomly("admin")}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  어드민 랜덤
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">이름</label>
                  <input
                    type="text"
                    required
                    value={signupForm.username}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="홍길동"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">이메일</label>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="admin@eduhub.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">비밀번호</label>
                  <input
                    type="text"
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="비밀번호 입력"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">전화번호</label>
                  <input
                    type="text"
                    required
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">역할</label>
                  <select
                    value={signupForm.role}
                    onChange={(e) =>
                      setSignupForm((prev) => ({ ...prev, role: e.target.value as SignupForm["role"] }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  >
                    <option value="admin">admin</option>
                    <option value="instructor">instructor</option>
                    <option value="user">user</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">생년월일</label>
                  <input
                    type="date"
                    required
                    value={signupForm.birthDate}
                    onChange={(e) => setSignupForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">성별</label>
                  <select
                    value={signupForm.gender}
                    onChange={(e) =>
                      setSignupForm((prev) => ({ ...prev, gender: e.target.value as SignupForm["gender"] }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  >
                    <option value="male">male</option>
                    <option value="female">female</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="mt-2 rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 px-5 py-3 text-sm font-bold shadow-md transition disabled:cursor-not-allowed disabled:opacity-60 ${submitButtonClassName}`}
            >
              <SendHorizontal className="h-4 w-4" />
              {isLoading ? "처리 중..." : `${submitLabel} 제출`}
            </button>
          </div>
        </form>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm font-medium text-emerald-600">{message}</p> : null}
        </div>

        {/* 결제 생성 카드 */}
        <div className="rounded-3xl border border-blue-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.5)] md:p-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-700">Payments</p>
              <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">결제 생성</h2>
              <p className="mt-1 text-sm text-slate-500">학생을 선택하고 결제를 생성합니다. 로그인 토큰이 필요합니다.</p>
            </div>
            <button
              type="button"
              onClick={openPaymentModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-700 px-5 py-3 text-sm font-bold shadow-md transition hover:bg-blue-800"
            >
              <CreditCard className="h-4 w-4" />
              결제 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
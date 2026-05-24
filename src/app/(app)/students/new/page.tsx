"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, UserPlus, CheckCircle2, Copy, Check } from "lucide-react";
import api from "../../../../lib/axiosInstance";
import Button from "../../../../components/ui/Button/Button";

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthDate: string;
  gender: "male" | "female" | "";
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const inputBase =
  "w-full rounded-full border px-6 py-4 text-[15px] text-ink placeholder:text-muted outline-none transition focus:ring-2";
const inputNormal = "border-border focus:border-primary focus:ring-primary/10";
const inputError = "border-red-400 focus:border-red-400 focus:ring-red-100";

const StudentNewPage = () => {
  const router = useRouter();

  const emptyForm: FormData = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    birthDate: "",
    gender: "",
  };

  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.username.trim()) next.username = "이름을 입력해주세요.";
    if (!form.email.trim()) next.email = "이메일을 입력해주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "올바른 이메일 형식이 아닙니다.";
    if (!form.password) next.password = "비밀번호를 입력해주세요.";
    else if (form.password.length < 6) next.password = "비밀번호는 6자 이상이어야 합니다.";
    if (!form.confirmPassword) next.confirmPassword = "비밀번호를 다시 입력해주세요.";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "비밀번호가 일치하지 않습니다.";
    if (!form.phone.trim()) next.phone = "휴대폰번호를 입력해주세요.";
    if (!form.birthDate) next.birthDate = "생년월일을 입력해주세요.";
    if (!form.gender) next.gender = "성별을 선택해주세요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsLoading(true);
      setSubmitError(null);
      await api.post("/auth/signup", {
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        birthDate: form.birthDate,
        gender: form.gender,
        role: "user",
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "학생 등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = async () => {
    await navigator.clipboard.writeText(`이메일: ${form.email}\n비밀번호: ${form.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ───── 성공 화면 ───── */
  if (success) {
    return (
      <div className="mx-auto mt-10 max-w-md px-4 sm:px-6">
        <div className="rounded-3xl bg-background p-8 text-center shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-ink">학생 등록 완료</h2>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-ink">{form.username}</span> 학생이 성공적으로
            등록됐습니다.
          </p>

          <div className="mt-6 rounded-3xl bg-paper p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">계정 정보</p>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="shrink-0 text-muted">이메일</span>
                <span className="truncate font-semibold text-ink">{form.email}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between gap-4">
                <span className="shrink-0 text-muted">비밀번호</span>
                <span className="font-semibold text-ink">{form.password}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              radius="pill"
              isFullWidth
              className="mt-4"
              onClick={copyCredentials}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              {copied ? "복사됨" : "계정 정보 복사"}
            </Button>
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              type="button"
              variant="outline"
              radius="pill"
              isFullWidth
              onClick={() => { setSuccess(false); setForm(emptyForm); setErrors({}); }}
            >
              계속 등록하기
            </Button>
            <Button
              type="button"
              variant="primary"
              radius="pill"
              isFullWidth
              onClick={() => router.push("/students")}
            >
              학생 목록으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ───── 등록 폼 ───── */
  return (
    <div className="mx-auto mt-6 max-w-2xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/students")}
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          학생 목록으로 돌아가기
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">학생 등록</h1>
        <p className="mt-2 text-sm text-muted">
          새 학생 계정을 관리자가 직접 생성합니다. 등록 후 계정 정보를 학생에게 전달해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* 기본 정보 카드 */}
        <div className="rounded-3xl bg-background p-8 sm:p-10 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.10)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">기본 정보</h2>
              <p className="mt-1 text-sm text-muted">학생의 신상 정보를 입력합니다.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* 이름 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">
                이름 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="홍길동"
                className={`mt-3 ${inputBase} ${errors.username ? inputError : inputNormal}`}
              />
              {errors.username && <p className="mt-1.5 text-xs text-red-500">{errors.username}</p>}
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-semibold text-ink">
                생년월일 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className={`mt-3 ${inputBase} ${errors.birthDate ? inputError : inputNormal}`}
              />
              {errors.birthDate && <p className="mt-1.5 text-xs text-red-500">{errors.birthDate}</p>}
            </div>

            {/* 휴대폰번호 */}
            <div>
              <label className="block text-sm font-semibold text-ink">
                휴대폰번호 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="010-0000-0000"
                className={`mt-3 ${inputBase} ${errors.phone ? inputError : inputNormal}`}
              />
              {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone}</p>}
            </div>

            {/* 성별 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">
                성별 <span className="text-red-400">*</span>
              </label>
              <div className="mt-3 flex gap-3">
                {(
                  [
                    { value: "male",   label: "남성" },
                    { value: "female", label: "여성" },
                  ] as const
                ).map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    radius="pill"
                    size="lg"
                    variant={form.gender === opt.value ? "primary" : "outline"}
                    className="flex-1"
                    onClick={() => handleChange("gender", opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              {errors.gender && <p className="mt-1.5 text-xs text-red-500">{errors.gender}</p>}
            </div>
          </div>
        </div>

        {/* 계정 정보 카드 */}
        <div className="rounded-3xl bg-background p-8 sm:p-10 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.10)]">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
              2
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink">계정 정보</h2>
              <p className="mt-1 text-sm text-muted">로그인에 사용할 이메일과 초기 비밀번호를 설정합니다.</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* 이메일 */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink">
                이메일 <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="student@example.com"
                className={`mt-3 ${inputBase} ${errors.email ? inputError : inputNormal}`}
              />
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-semibold text-ink">
                비밀번호 <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-3">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="6자 이상"
                  className={`${inputBase} pr-12 ${errors.password ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-semibold text-ink">
                비밀번호 확인 <span className="text-red-400">*</span>
              </label>
              <div className="relative mt-3">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  placeholder="비밀번호 재입력"
                  className={`${inputBase} pr-12 ${errors.confirmPassword ? inputError : inputNormal}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* 서버 에러 */}
        {submitError && (
          <div className="rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-600">
            {submitError}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            radius="pill"
            size="xl"
            isFullWidth
            onClick={() => router.push("/students")}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            radius="pill"
            size="xl"
            isFullWidth
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {isLoading ? "등록 중…" : "학생 등록"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentNewPage;

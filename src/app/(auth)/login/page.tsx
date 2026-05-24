'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SigninRequest, AuthResponse, ApiError } from '@/types/auth.types';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button/Button'; 
import Input from '@/components/ui/input/Input';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState<SigninRequest>({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response: AuthResponse = await authApi.signin(formData);

      const token = response.token;

      if (token) {
        login(token);
        alert('로그인 성공!');
        router.push('/dashboard'); 
      } else {
        setErrorMsg('로그인 응답 데이터가 올바르지 않습니다.');
      }
    } catch (error) {
      const err = error as ApiError;
      const message = err.response?.data?.message || err.message || '로그인 중 오류가 발생했습니다.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-paper text-ink">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 space-y-4 bg-card rounded-xl shadow-md border border-border">
        <h2 className="text-2xl font-bold text-center text-ink">로그인</h2>
        
        <Input 
          name="email" 
          type="email" 
          placeholder="이메일" 
          required 
          value={formData.email} 
          onChange={handleChange} 
        />
        <Input 
          name="password" 
          type="password" 
          placeholder="비밀번호" 
          required 
          value={formData.password} 
          onChange={handleChange} 
        />

        {errorMsg && <p className="text-sm font-medium text-danger">{errorMsg}</p>}
        
        <Button type="submit" isFullWidth isLoading={isLoading}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>

        <div className="text-sm text-center text-muted mt-4">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-primary hover:text-primary-hover underline transition-colors">
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}

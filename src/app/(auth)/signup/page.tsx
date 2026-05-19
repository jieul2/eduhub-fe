'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button'; 
import { SignupRequest } from '@/types/auth.types'; 
import { authApi } from '@/lib/api/auth'; 

export default function SignupPage() {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<SignupRequest>({
        username: '',
        email: '',
        password: '',
        role: 'student', 
        phone: '',
        birthDate: '',
        gender: 'male',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role: SignupRequest['role']) => {
        setFormData((prev) => ({ ...prev, role }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            await authApi.signup(formData);
            alert('가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
            router.push('/login');
        } catch (error) {
            if (error instanceof Error) {
                setErrorMsg(error.message);
            } else {
                setErrorMsg('회원가입 중 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-paper p-4">
            <form onSubmit={handleSignup} className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
                
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-ink">가입하기</h1>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink" htmlFor="username">이름</label>
                        <input 
                            id="username"
                            name="username"
                            type="text" 
                            required
                            placeholder="홍길동"
                            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink" htmlFor="email">이메일</label>
                        <input 
                            id="email"
                            name="email"
                            type="email" 
                            required
                            placeholder="hello@eduhub.com"
                            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink" htmlFor="password">비밀번호</label>
                        <input 
                            id="password"
                            name="password"
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink" htmlFor="phone">전화번호</label>
                        <input 
                            id="phone"
                            name="phone"
                            type="tel" 
                            required
                            placeholder="010-1234-5678"
                            className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-ink" htmlFor="birthDate">생년월일</label>
                            <input 
                                id="birthDate"
                                name="birthDate"
                                type="date" 
                                required
                                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.birthDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-ink" htmlFor="gender">성별</label>
                            <select 
                                id="gender"
                                name="gender"
                                required
                                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">남성</option>
                                <option value="female">여성</option>
                                <option value="other">기타</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-1">
                        <label className="text-sm font-medium text-ink">가입 유형</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'user', label: '학생/학부모' }, 
                                { value: 'instructor', label: '강사' },
                                { value: 'admin', label: '관리자(원장)' },
                            ].map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleRoleChange(option.value as SignupRequest['role'])}
                                    variant="outline"
                                    radius="xl"      
                                    className={`px-1 py-2 text-sm font-semibold transition-all h-auto ${
                                        formData.role === option.value 
                                            ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' 
                                            : 'text-muted hover:border-muted hover:bg-paper'
                                    }`}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {errorMsg && <p className="text-sm text-danger text-center">{errorMsg}</p>}

                <Button 
                    type="submit" 
                    isFullWidth 
                    size="xl" 
                    radius="xl"
                    disabled={isLoading}
                    className="mt-2"
                >
                    {isLoading ? '가입 중...' : '가입하기'}
                </Button>

                <p className="text-center text-sm text-muted">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
                        로그인
                    </Link>
                </p>
            </form>
        </div>
    );
}

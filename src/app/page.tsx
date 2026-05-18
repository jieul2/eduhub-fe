// src/app/page.tsx
import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-ink p-4 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-primary tracking-tight">
                EduHub
            </h1>
            <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl">
                강사, 수강생, 학부모를 하나로 연결하는 통합 관리 플랫폼.<br/>
                AI 자동화로 학원 운영의 새로운 기준을 경험하세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
                {/* 대시보드로 바로가기 임시 버튼 (추후 로그인 페이지로 연결) */}
                <Link 
                    href="/dashboard" 
                    className="rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-white transition-all hover:bg-primary-hover hover:scale-105 shadow-lg shadow-primary/30"
                >
                    대시보드 시작하기
                </Link>
            </div>
        </div>
    );
}

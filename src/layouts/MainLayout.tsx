'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRole } from './Layout.types';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);

    // TODO: 실제 프로젝트에서는 Zustand 상태, NextAuth 세션, 또는 API 기반 Context에서 현재 유저 권한을 가져와야 함
    // 테스트: 이 값을 'admin' | 'instructor' | 'user' 로 바꾸며 확인
    const currentUserRole: UserRole = 'admin'; 

const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen((prev) => !prev);
        } else {
            setIsDesktopMenuOpen((prev) => !prev);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-ink relative">
            <div
                className={`fixed inset-0 z-20 transition-opacity duration-300 md:hidden ${
                    isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
            />

            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                isDesktopMenuOpen={isDesktopMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                role={currentUserRole}
            />

            <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
                <Header
                    isMobileMenuOpen={isMobileMenuOpen}
                    isDesktopMenuOpen={isDesktopMenuOpen}
                    toggleSidebar={toggleSidebar}
                    role={currentUserRole}
                />

                <main className="flex-1 p-4 md:p-6">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
};

'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { UserRole } from './Layout.types';
import { useAuthStore } from '@/store/authStore';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);

    const user = useAuthStore((state) => state.user);
    
    // 백엔드에서 대문자('USER', 'INSTRUCTOR', 'ADMIN')로 올 경우를 대비해 소문자로 변환 처리
    const rawRole = user?.role?.toLowerCase();
    
    const currentUserRole: UserRole = (rawRole === 'admin' || rawRole === 'instructor' || rawRole === 'user')
        ? (rawRole as UserRole)
        : 'user'; 

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

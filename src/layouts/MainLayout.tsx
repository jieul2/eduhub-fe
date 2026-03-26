'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(true);

    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsMobileMenuOpen((prev) => !prev);
        } else {
            setIsDesktopMenuOpen((prev) => !prev);
        }
    };

    return (
        <div className="flex min-h-screen bg-background text-ink relative">
            {/* 모바일용 투명 배경 오버레이 */}
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
            />

            <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
                <Header
                    isMobileMenuOpen={isMobileMenuOpen}
                    isDesktopMenuOpen={isDesktopMenuOpen}
                    toggleSidebar={toggleSidebar}
                />

                <main className="flex-1 p-4 md:p-6">
                    <div className="mx-auto max-w-6xl">{children}</div>
                </main>
            </div>
        </div>
    );
};

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNavGroups } from './Sidebar';
import { UserRole } from './Layout.types';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
    isMobileMenuOpen: boolean;
    isDesktopMenuOpen: boolean;
    toggleSidebar: () => void;
    role: UserRole;
}

export const Header = ({ isMobileMenuOpen, isDesktopMenuOpen, toggleSidebar, role }: HeaderProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const { user, isLoggedIn, logout } = useAuthStore();
    
    // Next.js SSR Hydration 에러 방지용 (새로고침 시 깜빡임 방지)
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
const allItems = getNavGroups(role).flatMap((group) => group.items);
    
    const currentItem =
        allItems.find((item) => item.href === pathname) ||
        allItems
            .filter((item) => item.href !== '/')
            .sort((a, b) => b.href.length - a.href.length)
            .find((item) => pathname.startsWith(item.href));

    const pageTitle = currentItem ? currentItem.label : 'EduHub';

    return (
        <header
            className={cn(
                'sticky top-2 z-40 mx-4 flex h-16 shrink-0 items-center justify-between rounded-xl px-4 transition-all duration-300 ease-in-out border',
                isScrolled
                    ? 'border-border bg-background/90 shadow-sm backdrop-blur-md'
                    : isMobileMenuOpen
                        ? 'border-transparent bg-background max-md:border-border max-md:bg-background/90 max-md:shadow-sm max-md:backdrop-blur-md'
                        : 'border-transparent bg-background',
            )}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-paper focus:outline-none"
                    aria-label="메뉴 토글"
                >
                    {isMobileMenuOpen ? <X className="size-5 md:hidden" /> : <Menu className="size-5 md:hidden" />}
                    <Menu className="size-5 hidden md:block" />
                </button>
                <h1 className="flex items-center text-lg font-bold text-ink whitespace-nowrap">
                    <Link
                        href="/"
                        className={cn(
                            "text-primary transition-opacity hover:opacity-80 pr-3 mr-3 border-r-2 border-border",
                            isMobileMenuOpen ? "max-md:hidden" : "max-md:block",
                            isDesktopMenuOpen ? "md:hidden" : "md:block"
                        )}
                    >
                        EduHub
                    </Link>
                    <span>{pageTitle}</span>
                </h1>
            </div>

            {/* 오른쪽 유저 정보 & 인증 버튼 영역 */}
            <div className="flex items-center justify-end gap-4">
                {mounted && isLoggedIn ? (
                    // 1. 로그인 된 상태의 UI
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-ink max-sm:hidden">{user?.userName}님</span>
                        <div className="size-8 rounded-full bg-primary/20 cursor-pointer transition-transform hover:scale-105" title="내 프로필" />
                        <button 
                            onClick={logout} 
                            className="text-xs text-muted hover:text-ink transition-colors ml-2"
                        >
                            로그아웃
                        </button>
                    </div>
                ) : mounted && !isLoggedIn ? (
                    // 2. 로그인 되지 않은 상태의 UI
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm font-medium text-muted hover:text-primary transition-colors">
                            로그인
                        </Link>
                        <Link href="/signup" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
                            회원가입
                        </Link>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

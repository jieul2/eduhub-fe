'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNavGroups } from './Sidebar';
import { UserRole } from './Layout.types';

interface HeaderProps {
    isMobileMenuOpen: boolean;
    isDesktopMenuOpen: boolean;
    toggleSidebar: () => void;
    role: UserRole;
}

export const Header = ({ isMobileMenuOpen, isDesktopMenuOpen, toggleSidebar, role }: HeaderProps) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const allItems = getNavGroups(role).flatMap((group) => group.items);
    
    // 상세 페이지 진입 시 가장 알맞은 상위 메뉴의 이름을 찾아 헤더에 표시
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
                    {/* 모바일 아이콘 전환 */}
                    {isMobileMenuOpen ? <X className="size-5 md:hidden" /> : <Menu className="size-5 md:hidden" />}
                    {/* PC 아이콘 (항상 Menu) */}
                    <Menu className="size-5 hidden md:block" />
                </button>

                <h1 className="flex items-center text-lg font-bold text-ink whitespace-nowrap">
                    
                    <Link
                        href="/"
                        className={cn(
                            "text-primary transition-opacity hover:opacity-80 pr-3 mr-3 border-r-2 border-border",
                            isMobileMenuOpen ? "max-md:hidden" : "max-md:block", // 모바일에선 메뉴 열리면 숨김
                            isDesktopMenuOpen ? "md:hidden" : "md:block" // PC에선 메뉴 열리면 숨김
                        )}
                    >
                        EduHub
                    </Link>
                    <span>{pageTitle}</span>
                </h1>
            </div>

            <div className="flex items-center justify-end">
                <div className="size-8 rounded-full bg-primary/20 cursor-pointer transition-transform hover:scale-105" title="내 프로필" />
            </div>
        </header>
    );
};

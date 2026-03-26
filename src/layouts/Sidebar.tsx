'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    UserCircle,
    UsersRound,
    BookOpen,
    ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const NAV_GROUPS = [
    {
        group: '메인',
        items: [{ label: '대시보드', href: '/', icon: LayoutDashboard }],
    },
    {
        group: '학생/학부모',
        items: [
            { label: '학생 목록', href: '/students', icon: Users },
            { label: '학생 상세', href: '/students/detail', icon: UserCircle },
            { label: '학부모 목록', href: '/parents', icon: UsersRound },
        ],
    },
    {
        group: '수업 관리',
        items: [
            { label: '수업일지', href: '/class-logs', icon: BookOpen },
            { label: '진도/숙제', href: '/assignments', icon: ClipboardList },
        ],
    },
];

interface SidebarProps {
    isMobileMenuOpen: boolean;
    isDesktopMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar = ({ isMobileMenuOpen, isDesktopMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <>
            {/* 💻 1. 데스크탑 전용 사이드바 (md 이상에서만 보임) */}
            <aside
                className={cn(
                    'hidden md:flex flex-col sticky top-0 h-screen shrink-0 bg-paper transition-[width] duration-300 ease-in-out overflow-hidden',
                    isDesktopMenuOpen ? 'w-64 border-r border-border' : 'w-0 border-none'
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-border">
                    <Link href="/" className="font-bold text-primary transition-all text-xl whitespace-nowrap hover:opacity-80">
                        EduHub
                    </Link>
                </div>

                <nav className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
                    {NAV_GROUPS.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                            <span className="mb-1 px-3 text-xs font-semibold text-muted whitespace-nowrap">
                                {section.group}
                            </span>
                            <div className="grid grid-cols-1 gap-1">
                                {section.items.map((item) => {
                                    // ✨ 누락되었던 활성화 유지 로직 적용
                                    const isActive = item.href === '/'
                                        ? pathname === '/' 
                                        : pathname.startsWith(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors shrink-0',
                                                isActive
                                                    ? 'bg-primary text-background shadow-sm'
                                                    : 'text-ink hover:bg-border/50 hover:text-primary'
                                            )}
                                        >
                                            <Icon className="size-5 shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* 📱 2. 모바일 전용 사이드바 (md 미만에서만 보임) */}
            <aside
                className={cn(
                    'md:hidden fixed left-4 right-4 top-20 z-30 flex flex-col rounded-xl border shadow-lg bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out',
                    isMobileMenuOpen
                        ? 'opacity-100 border-border translate-y-0'
                        : 'opacity-0 pointer-events-none -translate-y-2 border-transparent'
                )}
            >
                <nav className="flex flex-row items-center overflow-x-auto p-2 gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {NAV_GROUPS.map((section, idx) => (
                        <div key={idx} className="flex flex-row items-center gap-1">
                            {/* 모바일 그룹 간 구분선 */}
                            {idx > 0 && <div className="w-px h-8 bg-border mx-1 shrink-0" />}

                            <div className="flex flex-row gap-1">
                                {section.items.map((item) => {
                                    // ✨ 모바일에도 똑같이 활성화 로직 적용
                                    const isActive = item.href === '/'
                                        ? pathname === '/' 
                                        : pathname.startsWith(item.href);
                                    const Icon = item.icon;

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                'flex items-center justify-center size-12 rounded-xl transition-colors shrink-0',
                                                isActive
                                                    ? 'bg-primary text-background shadow-sm shadow-primary/20'
                                                    : 'text-ink hover:bg-border/50 hover:text-primary'
                                            )}
                                            title={item.label}
                                        >
                                            <Icon className="size-5 shrink-0" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

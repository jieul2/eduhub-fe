'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, CalendarDays, Clock, MapPin,
    Users, CreditCard, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavGroup, UserRole } from './Layout.types';

const ALL_NAV_GROUPS: NavGroup[] = [
    {
        group: '핵심 메뉴',
        items: [
            { label: '대시보드', href: '/dashboard', icon: LayoutDashboard, allowedRoles: ['admin', 'instructor', 'user'] },
            { label: '학원 캘린더', href: '/calendar', icon: CalendarDays, allowedRoles: ['admin', 'instructor', 'user'] },
            { label: '내 시간표', href: '/classes', icon: Clock, allowedRoles: ['admin', 'instructor', 'user'] },
            { label: '강의실 예약', href: '/reservations', icon: MapPin, allowedRoles: ['admin', 'instructor'] },
        ],
    },
    {
        group: '관리',
        items: [
            { label: '학생 관리', href: '/students', icon: Users, allowedRoles: ['admin', 'instructor'] },
            { label: '결제 관리', href: '/payments', icon: CreditCard, allowedRoles: ['admin'] },
        ],
    },
    {
        group: '설정',
        items: [
            { label: '프로필 설정', href: '/settings', icon: Settings, allowedRoles: ['admin', 'instructor', 'user'] },
        ],
    },
];

export const getNavGroups = (role: UserRole): NavGroup[] => {
    return ALL_NAV_GROUPS
        .map(group => ({
            ...group,
            items: group.items.filter(item => item.allowedRoles.includes(role))
        }))
        .filter(group => group.items.length > 0);
};

interface SidebarProps {
    isMobileMenuOpen: boolean;
    isDesktopMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
    role: UserRole;
}

export const Sidebar = ({ isMobileMenuOpen, isDesktopMenuOpen, setIsMobileMenuOpen, role }: SidebarProps) => {
    const pathname = usePathname();
    const navGroups = getNavGroups(role);

    return (
        <>
            {/* 데스크탑 전용 사이드바 (md 이상에서만 보임) */}
            <aside
                className={cn(
                    'hidden md:flex flex-col sticky top-0 h-screen shrink-0 bg-paper transition-[width] duration-300 ease-in-out overflow-hidden z-30',
                    isDesktopMenuOpen ? 'w-64 border-r border-border' : 'w-0 border-none'
                )}
            >
                <div className="flex h-16 shrink-0 items-center justify-center border-b border-border">
                    <Link href="/" className="font-bold text-primary transition-all text-xl whitespace-nowrap hover:opacity-80">
                        EduHub
                    </Link>
                </div>

                <nav className="flex flex-col flex-1 overflow-y-auto p-4 gap-4">
                    {navGroups.map((section, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                            <span className="mb-1 px-3 text-xs font-semibold text-muted whitespace-nowrap">
                                {section.group}
                            </span>
                            <div className="grid grid-cols-1 gap-1">
                                {section.items.map((item) => {
                                    // 대시보드는 정확히 일치, 나머지는 하위 페이지 포함
                                    const isActive = item.href === '/dashboard' 
                                        ? pathname === '/dashboard' 
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

            {/* 모바일 전용 사이드바 (md 미만에서만 보임) */}
            <aside
                className={cn(
                    'md:hidden fixed left-4 right-4 top-21 z-30 flex flex-col rounded-xl border shadow-lg bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out',
                    isMobileMenuOpen
                        ? 'opacity-100 border-border translate-y-0 pointer-events-auto'
                        : 'opacity-0 border-transparent -translate-y-2 pointer-events-none'
                )}
            >
                <nav className="flex flex-row items-center overflow-x-auto p-2 gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {navGroups.map((section, idx) => (
                        <div key={idx} className="flex flex-row items-center gap-1">
                            {idx > 0 && <div className="w-px h-8 bg-border mx-1 shrink-0" />}

                            <div className="flex flex-row gap-1">
                                {section.items.map((item) => {
                                    const isActive = item.href === '/dashboard' 
                                        ? pathname === '/dashboard' 
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
                                                    ? 'bg-primary text-background shadow-sm max-md:shadow-primary/20'
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

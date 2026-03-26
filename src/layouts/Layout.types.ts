import { LucideIcon } from 'lucide-react';

// DB 스키마 기준 Role 설정
export type UserRole = 'admin' | 'instructor' | 'user';

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    allowedRoles: UserRole[];
}

export interface NavGroup {
    group: string;
    items: NavItem[];
}

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

// ✨ 헤더에서도 현재 페이지 이름을 찾기 위해 export 합니다.
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
	isOpen: boolean;
}

export const Sidebar = ({ isOpen }: SidebarProps) => {
	const pathname = usePathname();

	return (
		<aside
			className={cn(
				'flex flex-col bg-paper transition-all duration-300 ease-in-out shrink-0 overflow-hidden',
				// 열렸을 때: 모바일은 72px(아이콘만), PC는 256px(w-64) / 닫혔을 때: 넓이 0
				isOpen ? 'w-18 md:w-64 border-r border-border' : 'w-0 border-none',
			)}
		>
			{/* 로고 영역 */}
			<div className="flex h-16 shrink-0 items-center justify-center border-b border-border">
				<span className="font-bold text-primary transition-all md:text-xl text-sm whitespace-nowrap">
					<span className="hidden md:inline">EduHub</span>
					<span className="md:hidden">EH</span>
				</span>
			</div>

			{/* 메뉴 영역 */}
			<nav className="flex flex-1 flex-col gap-4 overflow-y-auto p-3 overflow-x-hidden">
				{NAV_GROUPS.map((section, idx) => (
					<div
						key={idx}
						className="flex flex-col gap-1"
					>
						{/* 대분류 타이틀 (모바일에선 숨김) */}
						<span className="mb-1 px-3 text-xs font-semibold text-muted hidden md:block whitespace-nowrap">
							{section.group}
						</span>

						{/* 소분류 메뉴 아이템들 */}
						{section.items.map((item) => {
							const isActive = pathname === item.href;
							const Icon = item.icon;

							return (
								<Link
									key={item.label}
									href={item.href}
									className={cn(
										'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap',
										isActive
											? 'bg-primary text-background'
											: 'text-ink hover:bg-border/50 hover:text-primary',
										'max-md:justify-center max-md:px-0', // 모바일에서는 가운데 정렬
									)}
									title={item.label}
								>
									<Icon className="shrink-0 size-5" />
									{/* PC 화면에서만 글자 표시 */}
									<span className="hidden md:block truncate">{item.label}</span>
								</Link>
							);
						})}
					</div>
				))}
			</nav>
		</aside>
	);
};

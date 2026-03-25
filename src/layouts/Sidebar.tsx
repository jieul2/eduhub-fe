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
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
	const pathname = usePathname();

	return (
		<aside
			className={cn(
				'transition-all duration-300 ease-in-out z-30 bg-paper',

				// [PC 환경]: 왼쪽 고정, 세로로 펼쳐짐
				'md:sticky md:top-0 md:h-screen md:shrink-0 md:flex md:flex-col md:overflow-hidden md:shadow-none',
				isOpen
					? 'md:w-64 md:border-r md:border-border'
					: 'md:w-0 md:border-none',

				// [모바일 환경]: 화면 전체를 덮는 오버레이 + 슬라이드 인/아웃
				'max-md:fixed max-md:left-4 max-md:right-4 max-md:top-21 max-md:rounded-xl max-md:border max-md:shadow-lg max-md:bg-background/95 max-md:backdrop-blur-md',
				isOpen
					? 'max-md:opacity-100 max-md:border-border max-md:translate-y-0'
					: 'max-md:opacity-0 max-md:pointer-events-none max-md:-translate-y-2',
			)}
		>
			{/* 로고 영역 (PC에서만 보임) */}
			<div className="hidden h-16 shrink-0 items-center justify-center border-b border-border md:flex">
				<Link
					href="/"
					className="font-bold text-primary transition-all text-xl whitespace-nowrap hover:opacity-80"
				>
					EduHub
				</Link>
			</div>

			{/* 메뉴 영역 */}
			<nav className="flex max-md:flex-row max-md:items-center max-md:overflow-x-auto max-md:p-2 max-md:gap-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:flex-col md:flex-1 md:overflow-y-auto md:p-4 md:gap-4">
				{NAV_GROUPS.map((section, idx) => (
					<div
						key={idx}
						className="flex max-md:flex-row max-md:items-center max-md:gap-1 md:flex-col md:gap-1"
					>
						{/* 모바일 그룹 간 구분선 (첫 그룹 제외) */}
						{idx > 0 && (
							<div className="hidden max-md:block w-px h-8 bg-border mx-1 shrink-0" />
						)}

						{/* 대분류 타이틀 (PC만 보임) */}
						<span className="hidden md:block mb-1 px-3 text-xs font-semibold text-muted whitespace-nowrap">
							{section.group}
						</span>

						{/* 소분류 메뉴 아이템들 */}
						<div className="flex max-md:flex-row max-md:gap-1 md:grid md:grid-cols-1 md:gap-1">
							{section.items.map((item) => {
								const isActive = pathname === item.href;
								const Icon = item.icon;

								return (
									<Link
										key={item.label}
										href={item.href}
										onClick={() => {
											if (window.innerWidth < 768) setIsOpen(false);
										}}
										className={cn(
											'flex items-center justify-center transition-colors shrink-0',
											// 모바일: 둥근 정사각형 아이콘 버튼 (사이즈 12 = 48px)
											'max-md:size-12 max-md:rounded-xl',
											// PC: 가로로 긴 텍스트 + 아이콘 버튼
											'md:gap-3 md:rounded-md md:px-3 md:py-2.5 md:text-sm md:font-medium md:whitespace-nowrap md:justify-start',
											isActive
												? 'bg-primary text-background shadow-sm max-md:shadow-primary/20'
												: 'text-ink hover:bg-border/50 hover:text-primary',
										)}
										title={item.label}
									>
										<Icon className="size-5 shrink-0" />
										<span className="hidden md:block truncate">
											{item.label}
										</span>
									</Link>
								);
							})}
						</div>
					</div>
				))}
			</nav>
		</aside>
	);
};

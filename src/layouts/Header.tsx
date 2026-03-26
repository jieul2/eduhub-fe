'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from './Sidebar';

interface HeaderProps {
	isSidebarOpen: boolean;
	toggleSidebar: () => void;
}

export const Header = ({ isSidebarOpen, toggleSidebar }: HeaderProps) => {
	const [isScrolled, setIsScrolled] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const currentItem = NAV_GROUPS.flatMap((group) => group.items).find(
		(item) => item.href === pathname,
	);
	const pageTitle = currentItem ? currentItem.label : 'EduHub';

	return (
		<header
			className={cn(
				'sticky top-2 z-40 mx-4 flex h-16 shrink-0 items-center justify-between rounded-xl px-4 transition-all duration-300 ease-in-out border',
				// 스크롤을 내렸거나 모바일에서 메뉴를 열었을 때 스타일 변경
				isScrolled
					? 'border-border bg-background/90 shadow-sm backdrop-blur-md' // 1. 스크롤 내리면 무조건 블러
					: isSidebarOpen
						? 'border-transparent bg-background max-md:border-border max-md:bg-background/90 max-md:shadow-sm max-md:backdrop-blur-md' // 2. 스크롤 안 함 + 메뉴 열림: 모바일만 블러, PC는 투명
						: 'border-transparent bg-background', // 3. 스크롤 안 함 + 메뉴 닫힘: 무조건 투명
			)}
		>
			{/* 좌측: 햄버거 버튼 + 현재 페이지 이름 */}
			<div className="flex items-center gap-4">
				<button
					onClick={toggleSidebar}
					className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-paper focus:outline-none"
					aria-label="메뉴 토글"
				>
					{isSidebarOpen ? (
						<X className="size-5 md:hidden" /> // 모바일 메뉴 열림
					) : (
						<Menu className="size-5 md:hidden" /> // 모바일 메뉴 닫힘
					)}
					<Menu className="size-5 hidden md:block" /> {/* PC는 항상 햄버거 */}
				</button>

				{/* 제목 표시 영역 */}
				<h1 className="text-lg font-bold text-ink whitespace-nowrap">
					{!isSidebarOpen && (
						<Link
							href="/"
							className="md:hidden text-primary transition-opacity hover:opacity-80 pr-1"
						>
							EduHub
						</Link>
					)}
					<span className={cn('md:inline', !isSidebarOpen && 'hidden')}>
						{pageTitle}
					</span>
				</h1>
			</div>

			{/* 우측: 프로필 이미지 등 */}
			<div className="flex items-center justify-end">
				<div className="size-8 rounded-full bg-primary/20" />
			</div>
		</header>
	);
};

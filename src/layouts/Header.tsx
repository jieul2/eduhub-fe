'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from './Sidebar';

interface HeaderProps {
	toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
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

				isScrolled
					? 'border-border bg-background/70 shadow-sm backdrop-blur-md' // 스크롤 시: 테두리 보임, 반투명 블러, 그림자
					: 'border-transparent bg-background', // 스크롤 안 했을 때: 투명한 테두리, 단색 배경
			)}
		>
			{/* 좌측: 햄버거 버튼 + 현재 페이지 이름 */}
			<div className="flex items-center gap-4">
				<button
					onClick={toggleSidebar}
					className="flex size-9 items-center justify-center rounded-md text-ink hover:bg-paper focus:outline-none"
				>
					<Menu className="size-5" />
				</button>
				<h1 className="text-lg font-bold text-ink">{pageTitle}</h1>
			</div>

			{/* 우측: 프로필 이미지 등 */}
			<div className="flex items-center justify-end">
				<div className="size-8 rounded-full bg-primary/20" />
			</div>
		</header>
	);
};

'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
	children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		if (typeof window === 'undefined') return true;
		return window.innerWidth >= 768;
	});

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	return (
		<div className="flex min-h-screen bg-background text-ink relative">
			<div
				className={`fixed inset-0 z-20 transition-opacity duration-300 md:hidden ${
					isSidebarOpen
						? 'opacity-100 pointer-events-auto'
						: 'opacity-0 pointer-events-none'
				}`}
				onClick={() => setIsSidebarOpen(false)}
			/>

			<Sidebar
				isOpen={isSidebarOpen}
				setIsOpen={setIsSidebarOpen}
			/>

			<div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
				<Header
					isSidebarOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>

				<main className="flex-1 p-4 md:p-6">
					<div className="mx-auto max-w-6xl">{children}</div>
				</main>
			</div>
		</div>
	);
};

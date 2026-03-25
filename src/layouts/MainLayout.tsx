'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
	children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	return (
		<div className="flex min-h-screen bg-background text-ink relative">
			<Sidebar isOpen={isSidebarOpen} />

			<div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
				<Header toggleSidebar={toggleSidebar} />

				<main className="flex-1 p-4 md:p-6">
					<div className="mx-auto max-w-6xl">{children}</div>
				</main>
			</div>
		</div>
	);
};

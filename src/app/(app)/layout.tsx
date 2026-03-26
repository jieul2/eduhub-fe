import { MainLayout } from '@/layouts/MainLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <MainLayout>{children}</MainLayout>;
}

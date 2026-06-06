import AuthGuard from "@/components/auth/AuthGuard";
import { MainLayout } from "@/layouts/MainLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <MainLayout>
        {children}
      </MainLayout>
    </AuthGuard>
  );
}

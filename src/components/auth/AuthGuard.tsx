"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/Spinner/Spinner";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && !isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, _hasHydrated, router]);

  // 로딩 중이거나 로그인되지 않았으면 스피너 표시
  if (!_hasHydrated || !isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduHub",
  description: "강사/수강생/학부모 통합 관리 및 AI 자동화 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

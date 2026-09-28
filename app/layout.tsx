import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { BRAND } from "@/lib/brand";
import WorkspaceProvider from "@/components/workspace/WorkspaceProvider";
import Experience from "@/components/workspace/Experience";
import Nav from "@/components/Nav";
import "./globals.css";

// 글꼴: 한글 명조(Noto Serif KR) + 숫자·영문용 Garamond
// 빌드할 때 글꼴 파일을 내려받지 않고, 브라우저가 필요한 글자만 Google Fonts 에서 가져옵니다.
// (한글 글꼴은 파일이 수백 개로 나뉘어 있어서, 빌드 중 다운로드가 자주 실패하기 때문이에요)
const fontsUrl =
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Noto+Serif+KR:wght@400;500;600&display=swap";

export const metadata: Metadata = {
  title: BRAND.name,
  description: BRAND.description,
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe7",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={fontsUrl} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <WorkspaceProvider>
          <Nav />
          <main className="relative pb-28 md:pb-0"><Suspense fallback={<div className="wrap py-20">서재 여는 중</div>}><Experience>{children}</Experience></Suspense></main>
        </WorkspaceProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

// 책 제목과 문장에 쓰는 명조(세리프) 글꼴
const serif = Noto_Serif_KR({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-noto-serif-kr",
});

export const metadata: Metadata = {
  title: "다시, 책",
  description: "읽던 책으로 자연스럽게 다시 돌아가는 독서 공간",
  appleWebApp: {
    capable: true,
    title: "다시, 책",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e6",
  viewportFit: "cover", // 아이폰 화면 끝까지 사용
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={serif.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-5xl px-6 pt-6 pb-36 md:px-10 md:pt-4 md:pb-24">
          {children}
        </main>
      </body>
    </html>
  );
}

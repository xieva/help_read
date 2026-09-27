import type { Metadata, Viewport } from "next";
import { EB_Garamond, Noto_Serif_KR } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

// 한글 제목과 문장에 쓰는 명조
const serifKr = Noto_Serif_KR({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  preload: false,
  variable: "--font-noto-serif-kr",
});

// 숫자와 영문(저자 원어 이름 등)에 쓰는 Garamond
const garamond = EB_Garamond({
  weight: ["400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-garamond",
});

export const metadata: Metadata = {
  title: "다시, 책",
  description: "읽던 책으로 자연스럽게 다시 돌아오는 개인 독서 공간",
  appleWebApp: {
    capable: true,
    title: "다시, 책",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4efe7",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${serifKr.variable} ${garamond.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <Nav />
        <main className="relative pb-28 md:pb-0">{children}</main>
      </body>
    </html>
  );
}

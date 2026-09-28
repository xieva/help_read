"use client";
// 모바일: 아래쪽 탭 바 / 데스크톱: 위쪽 가로 메뉴

import { BRAND } from "@/lib/brand";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "오늘" },
  { href: "/library", label: "서재" },
  { href: "/discover", label: "발견" },
];

function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (href === "/") return path === "/";
  if (href === "/library") return path.startsWith("/library") || path.startsWith("/books");
  return path.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();

  // 독서 모드에서는 메뉴를 숨깁니다 (웹 배포 주소는 끝에 "/"가 붙을 수 있어요)
  if (pathname.replace(/\/$/, "").endsWith("/read")) return null;

  return (
    <>
      {/* 데스크톱 상단 */}
      <header className="relative z-40 hidden md:block" style={{ viewTransitionName: "site-header" }}>
        <div className="wrap flex h-20 items-center justify-between">
          <Link href="/" className="font-serif text-[19px] tracking-[-0.01em] text-ink">
            {BRAND.name}
          </Link>
          <nav className="flex items-center gap-10 text-[14px]">
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 transition-colors ${active ? "text-ink" : "text-ink-3 hover:text-ink"}`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-desktop"
                      className="absolute inset-x-0 -bottom-0.5 h-px bg-ink"
                      transition={{ type: "spring", damping: 30, stiffness: 380 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 모바일 하단 탭 바 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/[0.07] bg-paper/[0.97] pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{ viewTransitionName: "site-nav" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-3">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`press relative flex h-[58px] flex-col items-center justify-center text-[13px] transition-colors ${
                  active ? "text-ink" : "text-ink-3"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-mobile"
                    className="absolute top-[9px] h-[4px] w-[4px] rounded-full bg-accent"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                )}
                <span className={active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

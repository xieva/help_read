"use client";
// 모바일: 아래쪽 탭 바 / 데스크톱: 위쪽 가로 메뉴
// - 로그인 전: 네 번째 탭이 "로그인"
// - 회원: "내 정보" / 어드민: "제작"
// - 서재 화면에서는 매장처럼 어두운 톤으로 바뀌어요 (html[data-theme="store"])

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import DateLine from "@/components/home/DateLine";
import { BRAND } from "@/lib/brand";

function isActive(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  if (href === "/") return path === "/";
  if (href === "/library") return path.startsWith("/library") || path.startsWith("/books") || path === "/book";
  return path.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, view, setView, signOut } = useAuth();
  const path = pathname.replace(/\/$/, "") || "/";
  const store = path === "/library";

  // 서재에서는 어두운 매장 톤 + 아이폰 상단 색도 맞춰요
  useEffect(() => {
    const html = document.documentElement;
    if (store) html.dataset.theme = "store";
    else delete html.dataset.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", store ? "#1c201e" : "#f4efe7");
  }, [store]);

  if (path.endsWith("/read") || path === "/login") return null;

  const account = !user
    ? { href: "/login", label: "로그인" }
    : user.role === "admin"
      ? { href: "/creator", label: "제작" }
      : { href: "/account", label: "내 정보" };
  const items = [
    { href: "/", label: "오늘" },
    { href: "/library", label: "서재" },
    { href: "/discover", label: "발견" },
    account,
  ];

  return (
    <>
      {/* 데스크톱 상단 */}
      <header className="relative z-40 hidden md:block" style={{ viewTransitionName: "site-header" }}>
        <div className="wrap flex h-20 items-center justify-between">
          <Link href="/" className="font-serif text-[19px] tracking-[-0.01em] text-ink">
            {BRAND.name}
          </Link>
          <nav className="flex items-center gap-9 text-[14px]">
            {items.slice(0, 3).map((item) => {
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
            <span className="h-4 w-px bg-rule" aria-hidden />
            {user?.role === "admin" && (
              <div className="flex rounded-full border border-rule p-0.5 text-[12.5px]" role="group" aria-label="화면 전환">
                {(["creator", "user"] as const).map((v) => (
                  <button
                    key={v}
                    aria-pressed={view === v}
                    onClick={() => {
                      setView(v);
                      router.push(v === "creator" ? "/creator" : "/");
                    }}
                    className={`rounded-full px-3 py-1 transition-colors ${view === v ? "bg-ink text-paper" : "text-ink-3 hover:text-ink"}`}
                  >
                    {v === "creator" ? "제작자" : "사용자"}
                  </button>
                ))}
              </div>
            )}
            {user ? (
              <>
                <Link href="/account" className="text-ink-2 hover:text-ink">
                  {user.name}
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    router.push("/");
                  }}
                  className="text-ink-3 hover:text-ink"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link href="/login" className="text-ink hover:text-accent">
                로그인
              </Link>
            )}
            <DateLine />
          </nav>
        </div>
      </header>

      {/* 모바일 하단 탭 바 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/[0.07] bg-paper pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{ viewTransitionName: "site-nav" }}
      >
        <div className="mx-auto grid max-w-md grid-cols-4">
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

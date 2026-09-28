"use client";
// 모바일: 아래쪽 탭 바 / 데스크톱: 위쪽 가로 메뉴
// - 네 번째 탭: "설정"(테마·계정) / 어드민은 "제작"
// - 색은 설정에서 고른 테마를 따라요 (components/theme)

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import DateLine from "@/components/home/DateLine";
import { BRAND } from "@/lib/brand";
import BrandMark from "@/components/brand/BrandMark";

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

  if (path.endsWith("/read") || path === "/login") return null;

  // 네 번째 탭: 어드민은 "제작", 나머지는 "설정"(테마 · 계정)
  const account = user?.role === "admin" ? { href: "/creator", label: "제작" } : { href: "/account", label: "설정" };
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
          <Link href="/" className="flex items-center gap-2.5 font-serif text-[19px] tracking-[-0.01em] text-ink">
            <BrandMark size={24} />
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
                      className="nav-ribbon absolute -top-[22px]"
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
            <Link href="/account" className={isActive(pathname, "/account") ? "text-ink" : "text-ink-3 hover:text-ink"}>
              설정
            </Link>
            {user ? (
              <>
                <span className="text-ink-2">{user.name}</span>
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
        className="tabbar fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)] md:hidden"
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
                    className="nav-ribbon absolute top-0"
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

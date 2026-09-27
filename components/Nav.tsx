"use client";
// "use client": 현재 주소를 알아야 해서 브라우저에서 동작하는 컴포넌트로 만듭니다.

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "오늘", icon: TodayIcon },
  { href: "/library", label: "서재", icon: LibraryIcon },
  { href: "/discover", label: "추천", icon: DiscoverIcon },
];

// 지금 보고 있는 화면이 어떤 메뉴에 속하는지 판단
function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/library") return pathname.startsWith("/library") || pathname.startsWith("/books");
  return pathname.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();

  // "계속 읽기" 화면에서는 독서에 집중하도록 메뉴를 숨깁니다
  if (pathname.endsWith("/read")) return null;

  return (
    <>
      {/* 위쪽: 앱 이름 + (데스크톱에서만) 메뉴 */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-10 md:pt-8">
        <Link href="/" className="font-serif text-[17px] tracking-tight text-ink">
          다시, 책
        </Link>
        <nav className="hidden gap-8 text-[14px] md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(pathname, item.href)
                  ? "text-ink underline decoration-accent/60 underline-offset-[6px]"
                  : "text-muted transition-colors hover:text-ink"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* 아래쪽 탭 바: 모바일에서만 보입니다 */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex max-w-md justify-around">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-24 flex-col items-center gap-1 pt-2.5 pb-2 text-[11px] transition-colors ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

// ── 아주 단순한 선 아이콘들 ─────────────────────────────────

function TodayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M12 6.5c-2-1.4-4.8-2-8-1.8v13c3.2-.2 6 .4 8 1.8 2-1.4 4.8-2 8-1.8v-13c-3.2-.2-6 .4-8 1.8Z" />
      <path d="M12 6.5v13" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 4.5v15M9 4.5v15M13.5 6l3.8 13.2" />
      <path d="M3 19.5h18" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="8" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4 4-1.6Z" />
    </svg>
  );
}

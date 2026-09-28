"use client";
// 버튼 모음
// PrimaryLink: 가장 중요한 한 가지 행동 (한 화면에 하나만)
// TextAction: 조용한 글자 버튼

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

type PrimaryProps = {
  href: string;
  children: React.ReactNode;
  sub?: string; // 버튼 안의 작은 보조 설명. 예: "143쪽부터"
  className?: string;
  tone?: "ink" | "night";
  gated?: boolean; // true 면 로그인한 사람만 이동할 수 있어요 (미리보기에서는 가입 안내)
};

export function PrimaryLink({ href, children, sub, className = "", tone = "ink", gated = false }: PrimaryProps) {
  const { gate } = useAuth();
  const colors = tone === "night" ? "bg-night-ink text-night hover:bg-white" : "bg-ink text-paper hover:bg-[#2b251f]";
  return (
    <Link
      href={href}
      onClick={(e) => {
        if (gated && !gate()) e.preventDefault();
      }}
      className={`press group inline-flex h-[54px] shrink-0 items-center justify-between gap-8 rounded-[14px] px-6 whitespace-nowrap text-[15.5px] ${colors} ${className}`}
    >
      <span className="font-medium">{children}</span>
      <span className="flex items-center gap-2 text-[13px] opacity-60">
        {sub}
        <Arrow className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

type TextActionProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function TextAction({ children, href, onClick, className = "" }: TextActionProps) {
  const cls = `press group inline-flex h-11 shrink-0 items-center whitespace-nowrap text-[15px] text-ink-2 hover:text-ink ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        <span className="link-line">{children}</span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      <span className="link-line">{children}</span>
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className} aria-hidden>
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

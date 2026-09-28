"use client";
// 제작자(어드민) 홈
// - 제작자 화면 ↔ 사용자 화면 전환
// - 예시 데이터로 모든 화면 미리보기
// - 이 브라우저의 계정·서재 현황

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { countAccounts } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { useWorkspace } from "./WorkspaceProvider";

const previews = [
  { href: "/", label: "오늘 (홈)" },
  { href: "/library", label: "서재 · 편집숍 서가" },
  { href: "/books/sapiens", label: "책 상세 · 돌리고 펼치기" },
  { href: "/books/sapiens/read", label: "독서 모드" },
  { href: "/discover", label: "발견 · 추천" },
  { href: "/login", label: "로그인 · 회원가입" },
];

export default function CreatorDashboard() {
  const { user, view, setView, signOut } = useAuth();
  const { books } = useWorkspace();
  const router = useRouter();
  const [accounts, setAccounts] = useState({ total: 0, admins: 0 });
  useEffect(() => setAccounts(countAccounts()), []);

  if (!user || user.role !== "admin") return null;

  const switchTo = (v: "creator" | "user") => {
    setView(v);
    if (v === "user") router.push("/");
  };

  return (
    <div className="wrap py-8 md:py-12">
      <p className="eyebrow">
        {BRAND.name} / 제작자
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <h1 className="text-[30px] font-medium tracking-tight md:text-[40px]">안녕하세요, {user.name}님</h1>
        <div className="flex rounded-full border border-rule p-1 text-[14px]" role="group" aria-label="화면 전환">
          {(["creator", "user"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => switchTo(v)}
              className={`press rounded-full px-4 py-2 ${view === v ? "bg-ink text-paper" : "text-ink-2"}`}
            >
              {v === "creator" ? "제작자 화면" : "사용자 화면"}
            </button>
          ))}
        </div>
      </div>

      <div className="creator-grid mt-10">
        <section>
          <span className="eyebrow">예시 화면 미리보기</span>
          <h2>모든 화면 둘러보기</h2>
          <p>예시 데이터로 채운 화면이에요. 여기서 누르는 기능은 내 서재에 영향을 주지 않아요.</p>
          <ul className="mt-5 divide-y divide-rule border-y border-rule">
            {previews.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="press flex items-center justify-between py-3.5 text-[15px] hover:text-accent">
                  {p.label}
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <span className="eyebrow">이 브라우저 현황</span>
          <h2>계정과 서재</h2>
          <dl className="mt-5 divide-y divide-rule border-y border-rule text-[15px]">
            <div className="flex justify-between py-3.5">
              <dt className="text-ink-3">가입한 계정</dt>
              <dd>
                <span className="numeral">{accounts.total}</span>개 (제작자 <span className="numeral">{accounts.admins}</span>)
              </dd>
            </div>
            <div className="flex justify-between py-3.5">
              <dt className="text-ink-3">내 서재</dt>
              <dd>
                <span className="numeral">{books.length}</span>권
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="reader-button press" onClick={() => switchTo("user")}>
              사용자 화면으로
            </button>
            <Link href="/account" className="reader-button secondary press">
              설정 · 테마
            </Link>
            <button
              className="reader-button secondary press"
              onClick={() => {
                signOut();
                router.push("/");
              }}
            >
              로그아웃
            </button>
          </div>
        </section>
      </div>

      <section className="mt-12 border-t border-rule pt-7 text-sm leading-loose text-ink-2">
        <h2 className="font-medium text-ink">알아두기</h2>
        <p>· 로그인 전 방문자는 예시 미리보기만 볼 수 있고, 쓰기 기능(책 추가·메모·도우미 등)은 잠겨 있어요.</p>
        <p>· 제작자 계정은 lib/auth.ts 의 ADMIN_EMAILS 에 적힌 이메일로 가입하면 만들어져요.</p>
        <p>· 지금은 계정이 이 브라우저에만 저장돼요. 실제 서비스 보안·기기 간 동기화는 서버(Supabase 등) 연결 후 가능해요.</p>
      </section>
    </div>
  );
}

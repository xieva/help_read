"use client";
// 설정: 테마 고르기 + 계정 (로그인 전에는 가입/로그인 버튼)

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { THEMES } from "@/lib/theme";
import { useAuth } from "./AuthProvider";

export default function AccountView() {
  const { user, signOut, setView } = useAuth();
  const { books } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="wrap max-w-2xl py-8 md:py-14">
      <h1 className="font-serif text-[30px] font-medium tracking-[-0.02em] md:text-[44px]">설정</h1>

      {/* 테마 */}
      <section className="mt-10">
        <p className="eyebrow">테마</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4" role="radiogroup" aria-label="테마">
          {THEMES.map((t) => {
            const on = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(t.id)}
                className={`press rounded-[10px] border p-3 text-left transition-colors ${
                  on ? "border-accent" : "border-rule hover:border-ink-4"
                }`}
              >
                {/* 작은 미리보기: 그 테마의 방에 놓인 원목 책장 한 칸 */}
                <span className="relative block h-16 overflow-hidden rounded-[6px]" style={{ background: t.swatch[0] }} aria-hidden>
                  <span
                    className="absolute inset-x-3 top-2 bottom-2 rounded-[2px]"
                    style={{ background: `var(--wood-v), ${t.swatch[3]}`, boxShadow: "0 4px 8px -3px rgb(0 0 0 / .5)" }}
                  />
                  <span
                    className="absolute inset-x-[18px] top-[13px] bottom-[14px]"
                    style={{
                      background: `radial-gradient(ellipse 60% 90% at 50% 0%, ${t.swatch[1]}66, transparent 75%), color-mix(in oklab, ${t.swatch[3]} 45%, black)`,
                    }}
                  />
                  <span className="absolute inset-x-3 bottom-[10px] h-[4px]" style={{ background: `var(--wood-h), ${t.swatch[3]}`, filter: "brightness(1.15)" }} />
                  <span className="absolute bottom-[14px] left-[22px] flex items-end gap-[2px]">
                    {[24, 30, 21, 27, 23].map((h, i) => (
                      <span
                        key={i}
                        className="block w-[5px] rounded-[1px]"
                        style={{ height: h, background: i % 2 ? t.swatch[2] : t.swatch[1], opacity: 0.55 + (i % 3) * 0.15 }}
                      />
                    ))}
                  </span>
                </span>
                <span className="mt-2.5 block text-[14px] font-medium text-ink">{t.name}</span>
                <span className="mt-0.5 block text-[12px] text-ink-3">{t.note}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 계정 */}
      <section className="mt-12">
        <p className="eyebrow">계정</p>
        {!user ? (
          <div className="mt-4">
            <p className="text-[15px] leading-relaxed text-ink-2">
              지금은 예시 서재를 둘러보는 중이에요. 가입하면 내 책을 꽂고 기록을 남길 수 있어요.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/login?mode=signup" className="reader-button press">
                회원가입
              </Link>
              <Link href="/login" className="reader-button secondary press">
                로그인
              </Link>
            </div>
          </div>
        ) : (
          <>
            <dl className="mt-4 divide-y divide-rule border-y border-rule text-[15px]">
              <div className="flex justify-between py-4">
                <dt className="text-ink-3">이름</dt>
                <dd>{user.name}</dd>
              </div>
              <div className="flex justify-between py-4">
                <dt className="text-ink-3">이메일</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="flex justify-between py-4">
                <dt className="text-ink-3">계정 종류</dt>
                <dd>{user.role === "admin" ? "제작자(어드민)" : "회원"}</dd>
              </div>
              <div className="flex justify-between py-4">
                <dt className="text-ink-3">내 서재</dt>
                <dd>
                  <span className="numeral">{books.length}</span>권
                </dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              {user.role === "admin" && (
                <button
                  className="reader-button press"
                  onClick={() => {
                    setView("creator");
                    router.push("/creator");
                  }}
                >
                  제작자 화면
                </button>
              )}
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
          </>
        )}
      </section>

      <p className="mt-12 text-[12.5px] leading-relaxed text-ink-3">
        테마와 계정, 서재는 이 브라우저에 저장돼요. 브라우저 데이터를 지우면 함께 사라져요.
      </p>
    </div>
  );
}

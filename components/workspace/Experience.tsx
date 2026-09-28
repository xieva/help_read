"use client";
// ─────────────────────────────────────────────────────────────
// 누가 보고 있는지에 따라 알맞은 화면을 보여줘요
//
// 1) 로그인 전      → 예시 서재 "미리보기"만. 쓰기 기능은 잠겨 있고, 위에 가입 안내가 떠요.
// 2) 일반 회원      → 내 서재 (책 추가·수정·메모 등 모든 기능)
// 3) 어드민(제작자) → 제작자 화면. 위쪽 전환 버튼으로 "사용자 화면"도 볼 수 있어요.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWorkspace } from "./WorkspaceProvider";
import UserWorkspace from "./UserWorkspace";

export default function Experience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready: authReady, view, setView } = useAuth();
  const { ready } = useWorkspace();
  const path = pathname.replace(/\/$/, "") || "/";

  if (path === "/login") return <>{children}</>;
  if (!authReady || (user && !ready)) {
    return (
      <div className="wrap py-24 text-center text-sm text-ink-3" role="status">
        서재 여는 중
      </div>
    );
  }

  // 1) 로그인 전: 미리보기
  if (!user) {
    if (path === "/creator" || path === "/book") {
      return (
        <div className="wrap py-24 text-center">
          <p className="font-serif text-[22px]">로그인이 필요한 화면이에요.</p>
          <Link href="/login" className="reader-button mt-6">
            로그인
          </Link>
        </div>
      );
    }
    return (
      <>
        <div className="preview-banner" role="note">
          <span>미리보기 중</span>
          <Link href="/login?mode=signup">가입하고 내 서재 만들기</Link>
          <Link href="/login">로그인</Link>
        </div>
        {children}
      </>
    );
  }

  const isAdmin = user.role === "admin";

  // 3) 어드민이 "제작자 화면"을 보고 있을 때: 예시 화면 + 제작자 도구
  if (isAdmin && view === "creator") {
    if (path === "/creator") return <>{children}</>;
    return (
      <>
        <div className="preview-banner" role="note">
          <span>제작자 화면 · 예시 데이터</span>
          <Link href="/creator">제작자 홈</Link>
          <button
            onClick={() => {
              setView("user");
              router.push("/");
            }}
          >
            사용자 화면으로
          </button>
        </div>
        {path === "/book" ? <UserWorkspace section="/book" /> : children}
      </>
    );
  }

  // 2) 회원(또는 어드민이 사용자 화면으로 전환했을 때): 내 서재
  const adminBar = isAdmin && (
    <div className="preview-banner is-user" role="note">
      <span>사용자 화면으로 보는 중</span>
      <button
        onClick={() => {
          setView("creator");
          router.push("/creator");
        }}
      >
        제작자 화면으로
      </button>
    </div>
  );

  if (path === "/creator") {
    return isAdmin ? (
      <>{children}</>
    ) : (
      <div className="wrap py-24 text-center">
        <p className="font-serif text-[22px]">제작자만 볼 수 있는 화면이에요.</p>
        <Link href="/" className="reader-button mt-6">
          내 서재로
        </Link>
      </div>
    );
  }
  if (["/", "/library", "/discover", "/book"].includes(path)) {
    return (
      <>
        {adminBar}
        <UserWorkspace key={path} section={path} />
      </>
    );
  }
  if (path.startsWith("/books/")) {
    return (
      <>
        {adminBar}
        <div className="wrap py-20">
          <h1 className="text-2xl">예시 책 페이지</h1>
          <p className="mt-3 text-ink-2">내 책과 기록은 서재에서 확인할 수 있어요.</p>
          <Link href="/library" className="reader-button mt-6">
            내 서재
          </Link>
        </div>
      </>
    );
  }
  return (
    <>
      {adminBar}
      {children}
    </>
  );
}

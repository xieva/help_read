"use client";
// 내 정보: 계정 확인 · 로그아웃 (어드민은 화면 전환도)

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { useAuth } from "./AuthProvider";

export default function AccountView() {
  const { user, signOut, setView } = useAuth();
  const { books } = useWorkspace();
  const router = useRouter();

  if (!user) {
    return (
      <div className="wrap py-24 text-center">
        <p className="font-serif text-[22px]">로그인하면 내 정보를 볼 수 있어요.</p>
        <Link href="/login" className="reader-button mt-6">
          로그인
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap max-w-xl py-10 md:py-16">
      <p className="eyebrow">내 정보</p>
      <h1 className="mt-2 text-[30px] font-medium tracking-tight">{user.name}</h1>
      <dl className="mt-8 divide-y divide-rule border-y border-rule text-[15px]">
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
      <div className="mt-8 flex flex-wrap gap-3">
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
      <p className="mt-10 text-[12.5px] leading-relaxed text-ink-3">
        계정과 서재는 이 브라우저에만 저장돼요. 브라우저 데이터를 지우면 함께 사라져요.
      </p>
    </div>
  );
}

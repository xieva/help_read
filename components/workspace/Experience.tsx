"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "./WorkspaceProvider";
import UserWorkspace from "./UserWorkspace";

export default function Experience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, preview, setPreview } = useWorkspace();
  const path = pathname.replace(/\/$/, "") || "/";
  if (!ready) return <div className="wrap py-20 text-sm text-ink-3" role="status">서재 여는 중</div>;
  if (path === "/creator") return <>{children}</>;
  if (preview) return <><div className="preview-banner"><span>제작자 미리보기 · 예시 데이터</span><Link href="/creator">제작자 화면</Link><button onClick={() => { setPreview(false); router.push("/"); }}>사용자 화면으로</button></div>{children}</>;
  if (["/", "/library", "/discover"].includes(path)) return <UserWorkspace key={path} section={path} />;
  if (path.startsWith("/books/")) return <div className="wrap py-20"><h1 className="text-2xl">예시 책 페이지</h1><p className="mt-3 text-ink-2">내 책과 기록은 서재에서 확인할 수 있어요.</p><Link href="/library" className="reader-button mt-6">내 서재</Link><Link href="/creator" className="ml-6 text-sm underline">제작자 미리보기</Link></div>;
  return <>{children}</>;
}

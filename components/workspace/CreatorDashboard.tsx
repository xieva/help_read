"use client";
import { BRAND } from "@/lib/brand";
import { useRouter } from "next/navigation";
import { useWorkspace } from "./WorkspaceProvider";

export default function CreatorDashboard() {
  const { books, ready, setPreview } = useWorkspace();
  const router = useRouter();
  const go = (preview: boolean, href: string) => { setPreview(preview); router.push(href); };
  return <div className="wrap py-10 md:py-16">
    <p className="eyebrow">{BRAND.name} / 제작자</p><h1 className="mt-3 text-3xl font-medium">화면과 데이터 확인</h1>
    <p className="mt-4 max-w-2xl leading-relaxed text-ink-2">실제 사용자 흐름과 예시 화면을 나눠 확인합니다. 예시를 열어도 내 서재는 바뀌지 않습니다.</p>
    <div className="creator-grid mt-10">
      <section><span className="eyebrow">사용자</span><h2>내 서재</h2><p>빈 서재부터 시작해 책을 추가하고, 읽은 쪽수와 메모를 저장합니다.</p><p className="mt-3">이 브라우저에 저장된 책 {ready ? books.length : "—"}권</p><button className="reader-button mt-6" onClick={() => go(false, "/")}>사용자 화면 열기</button></section>
      <section><span className="eyebrow">제작자 미리보기</span><h2>예시 서재</h2><p>준비된 책과 독서 기록으로 기존 화면을 살펴봅니다. AI 답변과 추천도 예시입니다.</p><div className="mt-6 flex flex-wrap gap-3"><button className="reader-button" onClick={() => go(true, "/")}>예시 홈</button><button className="reader-button secondary" onClick={() => go(true, "/library")}>예시 서재</button><button className="reader-button secondary" onClick={() => go(true, "/discover")}>예시 발견</button></div></section>
    </div>
    <section className="mt-12 border-t border-rule pt-7 text-sm leading-loose text-ink-2"><h2 className="font-medium text-ink">현재 구현 범위</h2><p>사용자: 책 등록·수정·삭제, 검색·상태 필터, 쪽수·메모 저장</p><p>저장: 이 브라우저 안에 보관. 로그인과 기기 간 동기화는 아직 연결하지 않았습니다.</p><p>이 페이지는 공개된 제작자 미리보기입니다. 관리자 인증이나 다른 사용자의 기록 접근 기능은 없습니다.</p><p>서가 전체 디자인과 AI 표지 생성은 시안 승인 후 별도로 적용합니다.</p></section>
  </div>;
}

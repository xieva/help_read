"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BookStage from "@/components/book/BookStage";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { getCatalogBook, matchCatalogBook } from "@/lib/catalog";
import CatalogDetails from "./CatalogDetails";

export default function CatalogPage() {
  const params = useSearchParams();
  const { gate } = useAuth();
  const { books } = useWorkspace();
  const entry = getCatalogBook(params.get("id") ?? "");
  if (!entry) return <div className="wrap py-20"><h1 className="text-2xl">책을 찾지 못했어요.</h1><Link className="reader-button mt-6" href="/discover">탐색으로</Link></div>;
  const own = books.find((b) => matchCatalogBook(b)?.id === entry.id);
  const viewer = { ...entry, description: entry.summary, currentPage: 0, totalPages: 240, status: "want", cover: { bg: "#6c7468", ink: "#f4eee2", style: "classic" as const } };
  return <div className="wrap pt-5 pb-16">
    <Link href="/discover" className="text-sm text-ink-2">← 탐색</Link>
    <div className="mt-8 grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className="overflow-x-clip py-8"><BookStage book={viewer} settings={false} className="[--w:180px] md:[--w:210px]" /></div>
      <div><p className="eyebrow">{entry.genre} · {entry.tags.join(" · ")}</p><h1 className="mt-3 font-serif text-4xl leading-snug">{entry.title}</h1><p className="mt-3 text-sm text-ink-2">{entry.author}</p><p className="mt-8 font-serif text-xl leading-relaxed">{entry.hook}</p>
        {own ? <Link className="reader-button mt-7" href={`/book?id=${encodeURIComponent(own.id)}`}>내 서재에서 보기</Link> : <Link className="reader-button mt-7" href={`/library?add=${entry.id}`} onClick={(e) => { if (!gate()) e.preventDefault(); }}>+ 내 서재에 추가</Link>}
        <p className="mt-4 text-xs text-ink-3">책을 밀어 돌리거나 앞면·뒷면 버튼으로 표지를 둘러보세요.</p>
      </div>
    </div>
    <div className="mx-auto max-w-2xl"><CatalogDetails book={entry} /></div>
  </div>;
}

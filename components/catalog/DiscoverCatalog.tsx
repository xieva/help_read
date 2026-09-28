"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import BookCover from "@/components/book/BookCover";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";
import { catalogBooks, matchCatalogBook, searchCatalog } from "@/lib/catalog";

const genres = ["전체", "소설", "인문", "과학", "경제"];
const tags = [...new Set(catalogBooks.flatMap((b) => b.tags))].sort((a, b) => a.localeCompare(b, "ko"));
const cover = { bg: "#59675c", ink: "#f4eee2", style: "classic" as const };

export default function DiscoverCatalog() {
  const { gate } = useAuth();
  const { books } = useWorkspace();
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("전체");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("curated");
  const [page, setPage] = useState(0);
  const owned = new Map(books.map((b) => [matchCatalogBook(b)?.id, b.id]));
  const results = useMemo(() => {
    const result = searchCatalog(query).filter((b) => (genre === "전체" || b.genre === genre) && (!tag || b.tags.includes(tag)));
    if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    if (sort === "author") result.sort((a, b) => a.author.localeCompare(b.author, "ko"));
    return result;
  }, [query, genre, tag, sort]);
  const pages = Math.ceil(results.length / 8);
  const reset = () => { setQuery(""); setGenre("전체"); setTag(""); setSort("curated"); setPage(0); };
  return <div className="wrap py-6 md:py-10">
    <p className="eyebrow">THE NEXT CHAPTER</p>
    <h1 className="mt-2 font-serif text-[34px] md:text-[44px]">다음 책을 찾아요.</h1>
    <p className="mt-3 text-sm text-ink-2">제목이 떠오르지 않아도, 관심 있는 주제부터.</p>
    <div className="catalog-controls">
      <label className="catalog-search"><span aria-hidden="true">⌕</span><input type="search" aria-label="책 검색" placeholder="제목, 저자, 주제 검색" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} /></label>
      <div className="catalog-chips" role="group" aria-label="장르 선택">{genres.map((g) => <button key={g} aria-pressed={genre === g} onClick={() => { setGenre(g); setPage(0); }}>{g}</button>)}</div>
      <div className="catalog-selects">
        <label>주제<select aria-label="관심 주제" value={tag} onChange={(e) => { setTag(e.target.value); setPage(0); }}><option value="">모든 주제</option>{tags.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label>정렬<select aria-label="정렬" value={sort} onChange={(e) => { setSort(e.target.value); setPage(0); }}><option value="curated">기본 순서</option><option value="title">제목순</option><option value="author">저자순</option></select></label>
        {(query || genre !== "전체" || tag || sort !== "curated") && <button onClick={reset} className="ml-auto underline">초기화</button>}
      </div>
    </div>
    <p className="mb-5 text-xs text-ink-3" role="status">{results.length}권 · 전체 카탈로그 {catalogBooks.length}권</p>
    <div className="catalog-results">{results.slice(page * 8, page * 8 + 8).map((b) => <article className="catalog-card" key={b.id}>
      <Link href={`/catalog?id=${b.id}`} className="catalog-card-art" aria-label={`${b.title} 자세히 보기`}><BookCover book={{ ...b, cover }} /></Link>
      <h2><Link href={`/catalog?id=${b.id}`}>{b.title}</Link></h2><p className="mt-1">{b.author} · {b.genre}</p><p className="catalog-hook">{b.hook}</p>
      <div className="catalog-card-actions"><Link href={`/catalog?id=${b.id}`}>둘러보기 ↗</Link>{owned.has(b.id) ? <Link href={`/book?id=${encodeURIComponent(owned.get(b.id)!)}`}>내 서재에 있음 ✓</Link> : <Link href={`/library?add=${b.id}`} onClick={(e) => { if (!gate()) e.preventDefault(); }}>+ 서재에 추가</Link>}</div>
    </article>)}</div>
    {results.length === 0 && <div className="py-14 text-center"><p className="text-ink-2">이 조건에 맞는 책이 없어요.</p><button onClick={reset} className="reader-button mt-5">전체 책 보기</button><p className="mt-5 text-sm text-ink-3">찾는 책이 아직 없다면 <Link href="/library?new=1" className="underline" onClick={(e) => { if (!gate()) e.preventDefault(); }}>직접 추가</Link>할 수 있어요.</p></div>}
    {pages > 1 && <nav aria-label="탐색 페이지" className="mt-10 flex items-center justify-center gap-7"><button disabled={page === 0} className="reader-button secondary disabled:opacity-30" onClick={() => setPage(page - 1)}>← 이전</button><span className="text-sm">{page + 1} / {pages}</span><button disabled={page >= pages - 1} className="reader-button secondary disabled:opacity-30" onClick={() => setPage(page + 1)}>다음 →</button></nav>}
  </div>;
}

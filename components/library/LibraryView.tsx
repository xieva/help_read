"use client";
// 예시 서재: 한 줄 도구 막대(상태 탭 · 검색) + 편집숍 서가

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Book, BookStatus } from "@/data/books";
import type { Segment } from "@/lib/library";
import BookstoreShelf from "@/components/book/BookstoreShelf";
import ShelfToolbar from "./ShelfToolbar";

export type LibraryItem = {
  book: Book;
  progress: number;
  segments: Segment[];
  chapterLabel?: string;
  year?: number;
  meta: string;
};

type Filter = "all" | BookStatus;
const labels: Record<Filter, string> = { all: "전체", reading: "읽는 중", finished: "읽음", want: "읽고 싶음" };

export default function LibraryView({ items }: { items: LibraryItem[] }) {
  const params = useSearchParams();
  const initial = params.get("filter") as Filter | null;
  const [filter, setFilter] = useState<Filter>(initial && initial in labels ? initial : "all");
  const [query, setQuery] = useState("");

  const choose = (key: Filter) => {
    setFilter(key);
    // 새로고침해도 같은 필터가 유지되도록 주소만 살짝 바꿔요
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", key);
    window.history.replaceState(window.history.state, "", url);
  };

  const q = query.trim().toLowerCase();
  const visible = items.filter(
    ({ book }) =>
      (filter === "all" || book.status === filter) &&
      (!q || [book.title, book.author, book.authorOriginal, book.genre].some((f) => f?.toLowerCase().includes(q))),
  );
  const count = (key: Filter) => (key === "all" ? items.length : items.filter((i) => i.book.status === key).length);

  return (
    <div className="mt-3 md:mt-4">
      <ShelfToolbar
        tabs={(Object.keys(labels) as Filter[]).map((key) => ({ key, label: labels[key], count: count(key) }))}
        active={filter}
        onTab={(key) => choose(key as Filter)}
        query={query}
        onQuery={setQuery}
      />
      {visible.length ? (
        <BookstoreShelf books={visible.map(({ book }) => ({ ...book, href: `/books/${book.id}` }))} />
      ) : (
        <div className="py-20 text-center">
          <p className="font-serif text-[20px]">{q ? `‘${query.trim()}’에 해당하는 책이 없어요.` : "이 칸은 비어 있어요."}</p>
          <p className="mt-3 text-[14px] text-ink-3">제목의 일부나 저자 이름으로 다시 찾아보세요.</p>
        </div>
      )}
    </div>
  );
}

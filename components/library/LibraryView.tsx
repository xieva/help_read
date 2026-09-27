"use client";
// 서재의 움직이는 부분: 검색, 필터(전체 / 읽는 중 / 읽음 / 읽고 싶음), 책장 목록

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Book, BookStatus } from "@/data/books";
import type { Segment } from "@/lib/library";
import BookCover from "@/components/book/BookCover";
import BookMorph from "@/components/book/BookMorph";
import ChapterMap from "@/components/book/ChapterMap";

export type LibraryItem = {
  book: Book;
  progress: number;
  segments: Segment[];
  chapterLabel?: string;
  year?: number;
  meta: string;
};

type Filter = "all" | BookStatus;

const tabs: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "reading", label: "읽는 중" },
  { key: "finished", label: "읽음" },
  { key: "want", label: "읽고 싶음" },
];

const statusText: Record<BookStatus, string> = { reading: "읽는 중", finished: "읽음", want: "읽고 싶음" };

export default function LibraryView({ items }: { items: LibraryItem[] }) {
  const params = useSearchParams();
  const initial = (params.get("filter") as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(tabs.some((t) => t.key === initial) ? initial : "all");
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const choose = (key: Filter) => {
    setFilter(key);
    // 새로고침해도 같은 필터가 유지되도록 주소만 살짝 바꿔요
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", key);
    window.history.replaceState(window.history.state, "", url);
  };

  const count = (key: Filter) => (key === "all" ? items.length : items.filter((i) => i.book.status === key).length);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return items.filter(({ book }) =>
      [book.title, book.author, book.authorOriginal, book.genre].some((f) => f?.toLowerCase().includes(q)),
    );
  }, [items, q]);

  const byStatus = (s: BookStatus) => items.filter((i) => i.book.status === s);
  const view = q ? "search" : filter;

  return (
    <div className="mt-10 md:mt-14">
      {/* 검색과 필터: 스크롤해도 위에 붙어 있어요 */}
      <div
        className={`sticky top-0 z-30 -mx-[22px] px-[22px] pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow] duration-300 md:-mx-12 md:px-12 ${
          scrolled ? "bg-paper shadow-[0_1px_0_rgba(30,26,22,0.08)]" : "bg-transparent"
        }`}
      >
        <div className="flex flex-col-reverse gap-1 md:flex-row md:items-center md:justify-between md:gap-10">
          <div className="no-scrollbar -mx-1 flex gap-7 overflow-x-auto px-1">
            {tabs.map((t) => {
              const active = !q && filter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => {
                    setQuery("");
                    choose(t.key);
                  }}
                  className={`press relative shrink-0 py-3.5 text-[15px] transition-colors ${
                    active ? "text-ink" : "text-ink-3 hover:text-ink-2"
                  }`}
                >
                  {t.label}
                  <span className="numeral ml-1 align-super text-[11px] text-ink-4">{count(t.key)}</span>
                  {active && (
                    <motion.span
                      layoutId="library-tab"
                      className="absolute inset-x-0 bottom-2 h-[1.5px] bg-ink"
                      transition={{ type: "spring", damping: 32, stiffness: 420 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <label className="flex h-12 items-center gap-3 border-b border-rule transition-colors focus-within:border-ink/50 md:w-[300px]">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-3" aria-hidden>
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목이나 저자로 찾기"
              className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-4"
              aria-label="서재에서 찾기"
            />
            {query && (
              <button onClick={() => setQuery("")} className="press text-[13px] text-ink-3 hover:text-ink">
                지우기
              </button>
            )}
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          className="pt-10 pb-10 md:pt-14"
        >
          {view === "search" && <SearchResults results={results} query={query.trim()} />}

          {view === "all" && (
            <div className="space-y-20 md:space-y-28">
              <Group title="펼쳐 둔 책">
                <ReadingList items={byStatus("reading")} />
              </Group>
              <Group title="읽고 싶은 책" note="다음에 펼칠 책들">
                <Shelf items={byStatus("want")} />
              </Group>
              <FinishedByYear items={byStatus("finished")} />
            </div>
          )}

          {view === "reading" && <ReadingList items={byStatus("reading")} />}
          {view === "want" && <Shelf items={byStatus("want")} showReason />}
          {view === "finished" && <FinishedByYear items={byStatus("finished")} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Group({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-8 flex items-baseline gap-3">
        <h2 className="font-serif text-[22px] md:text-[26px]">{title}</h2>
        {note && <p className="text-[13px] text-ink-3">{note}</p>}
      </div>
      {children}
    </section>
  );
}

// 읽는 중인 책: 크게, 어디쯤인지와 함께
function ReadingList({ items }: { items: LibraryItem[] }) {
  return (
    <div className="grid gap-12 md:grid-cols-2 md:gap-16">
      {items.map(({ book, segments, chapterLabel, meta }) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="group grid grid-cols-[92px_1fr] items-end gap-6 md:grid-cols-[124px_1fr] md:gap-8"
        >
          <BookMorph id={book.id}>
            <div className="transition-transform duration-500 ease-[var(--ease-book)] group-hover:-translate-y-1.5">
              <BookCover book={book} className="book-pages w-full" />
            </div>
          </BookMorph>
          <div className="pb-1">
            <p className="font-serif text-[22px] leading-snug md:text-[26px]">{book.title}</p>
            <p className="mt-1 text-[14px] text-ink-3">{book.author}</p>
            <ChapterMap segments={segments} current={book.currentPage} showLabels={false} className="mt-5" />
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
              <span className="numeral text-ink-2">{book.currentPage}</span> /{" "}
              <span className="numeral">{book.totalPages}</span>쪽{chapterLabel && ` · ${chapterLabel}`} · {meta}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// 책장: 표지들이 선반 선 위에 서 있어요. 책이 많아져도 줄 단위로 가지런히 쌓입니다.
function Shelf({ items, showReason = false }: { items: LibraryItem[]; showReason?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-y-10 [--cw:86px] sm:grid-cols-4 md:grid-cols-5 md:gap-y-14 md:[--cw:112px] lg:grid-cols-6">
      {items.map(({ book, meta }) => (
        <Link key={book.id} href={`/books/${book.id}`} className="group block px-2 md:px-3">
          <div className="flex h-[calc(var(--cw)*1.72)] items-end justify-center">
            <BookMorph id={book.id}>
              <div
                className="transition-transform duration-500 ease-[var(--ease-book)] group-hover:-translate-y-2 group-active:-translate-y-1"
                style={{ width: `calc(var(--cw) * ${book.cover.size ?? 1})` }}
              >
                <BookCover book={book} className="book-lift w-full" />
              </div>
            </BookMorph>
          </div>
          <div className="-mx-2 h-px bg-ink/20 md:-mx-3" />
          <div className="-mx-2 h-3 bg-gradient-to-b from-ink/[0.05] to-transparent md:-mx-3" />
          <p className="mt-0.5 line-clamp-2 font-serif text-[13.5px] leading-snug md:text-[14.5px]">{book.title}</p>
          <p className="mt-1 truncate text-[11.5px] text-ink-3">{book.author}</p>
          <p className="mt-0.5 truncate text-[11.5px] text-ink-4">{meta}</p>
          {showReason && book.addedReason && (
            <p className="mt-2 hidden text-[12px] leading-relaxed text-ink-2 md:block">{book.addedReason}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

function FinishedByYear({ items }: { items: LibraryItem[] }) {
  const years = [...new Set(items.map((i) => i.year))].sort((a, b) => (b ?? 0) - (a ?? 0));
  return (
    <div className="space-y-16 md:space-y-24">
      {years.map((year) => {
        const list = items.filter((i) => i.year === year);
        return (
          <section key={year}>
            <div className="mb-8 flex items-baseline gap-3">
              <h2 className="font-serif text-[22px] md:text-[26px]">
                다 읽은 책 <span className="numeral ml-1 text-ink-3">{year}</span>
              </h2>
              <p className="text-[13px] text-ink-3">
                <span className="numeral">{list.length}</span>권
              </p>
            </div>
            <Shelf items={list} />
          </section>
        );
      })}
    </div>
  );
}

function SearchResults({ results, query }: { results: LibraryItem[]; query: string }) {
  if (results.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-serif text-[20px]">‘{query}’에 해당하는 책이 서재에 없어요.</p>
        <p className="mt-3 text-[14px] text-ink-3">제목의 일부나 저자 이름으로 다시 찾아보세요.</p>
      </div>
    );
  }
  return (
    <div>
      <p className="eyebrow mb-4">
        <span className="numeral">{results.length}</span>권을 찾았어요
      </p>
      <ul>
        {results.map(({ book, meta }) => (
          <li key={book.id} className="border-b border-rule/70 last:border-none">
            <Link href={`/books/${book.id}`} className="press group flex items-center gap-5 py-4">
              <BookMorph id={book.id}>
                <div className="w-12 shrink-0">
                  <BookCover book={book} className="book-lift w-full" />
                </div>
              </BookMorph>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[17px]">
                  <Highlight text={book.title} query={query} />
                </p>
                <p className="mt-0.5 truncate text-[13px] text-ink-3">
                  <Highlight text={book.author} query={query} /> · {book.genre}
                </p>
              </div>
              <div className="shrink-0 text-right text-[12px] text-ink-3">
                <p className="text-ink-2">{statusText[book.status]}</p>
                <p className="mt-0.5">{meta}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[2px] bg-accent/15 text-inherit">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

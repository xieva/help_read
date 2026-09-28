"use client";
// ─────────────────────────────────────────────────────────────
// 편집숍 서가 (디자인 C)
//
// - 카테고리 하나 = 책장 하나. 책장 안에서는 선반 4칸이 위아래로 쌓여요.
//   한 책장이 가득 차면 같은 카테고리의 다음 책장이 오른쪽에 이어지고, 책장끼리는 좌우로 넘겨요.
// - 책은 진짜 3D 오브젝트(표지·책등·윗면·종이 면)예요. 책등이 보이게 꽂혀 있다가
//   한 번 누르면 옆 책들이 비켜나며 표지 쪽으로 돌아 나오고, 한 번 더 누르면 제자리에 꽂혀요.
// - 모든 책은 책등이 보이게 세워요. 빈 곳은 반투명 책등으로 채워요.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BookStatus, Cover } from "@/data/books";
import BookCover from "./BookCover";
import BookMorph from "./BookMorph";

export type ShelfBook = {
  id: string;
  title: string;
  author: string;
  genre: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  cover: Cover;
  coverImage?: string;
  href: string;
  readHref?: string;
  lastReadAt?: string;
};

type Props = {
  books: ShelfBook[];
  variant?: "store" | "strip"; // store: 책장 여러 개 / strip: 선반 한 줄(홈)
  onAdd?: () => void; // 빈 선반의 "+ 여기에 다음 책 꽂기"
};

const BAY_INNER = 300; // 책장 안쪽 너비(px, 배율 1 기준). 모든 책장이 같은 크기라 서점처럼 가지런해요.
const SHELVES = 4;
const statusText: Record<BookStatus, string> = { reading: "읽는 중", want: "읽고 싶은 책", finished: "다 읽은 책" };

// 장르 이름을 서가 카테고리로 묶어요 (예: "역사 · 인문" → 인문)
export function shelfCategory(genre: string): string {
  const first = genre.split("·")[0].trim();
  if (["인문", "역사", "철학", "사회", "심리"].includes(first)) return "인문";
  if (first === "경제" || first === "경영") return "경제·경영";
  return first || "미분류";
}

const seedOf = (text: string) => Array.from(text).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

// 책 크기 (배율 1 기준 px)
function dims(b: ShelfBook) {
  const size = b.cover.size ?? 0.9 + (seedOf(b.title) % 20) / 100;
  const h = Math.round(112 * Math.min(1.12, Math.max(0.86, size)));
  return {
    h,
    bw: Math.round(h / 1.38), // 표지 너비
    t: Math.round(Math.min(40, Math.max(22, b.totalPages / 16))), // 두께
  };
}

type Shelf = { spines: ShelfBook[]; free: number; pop?: string };
type Bay = { key: string; category: string; part: number; shelves: Shelf[]; count: number };

function buildBays(books: ShelfBook[]): Bay[] {
  const groups = new Map<string, ShelfBook[]>();
  books.forEach((b) => {
    const key = shelfCategory(b.genre);
    groups.set(key, [...(groups.get(key) ?? []), b]);
  });
  const order: Record<BookStatus, number> = { reading: 0, want: 1, finished: 2 };
  const bays: Bay[] = [];

  [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([category, list]) => {
      const sorted = [...list].sort((a, b) => order[a.status] - order[b.status]);
      const rest = sorted;
      const mine: Bay[] = [];
      const lastBay = () => mine[mine.length - 1];
      const lastShelf = () => lastBay().shelves[lastBay().shelves.length - 1];
      const newShelf = () => {
        if (mine.length === 0 || lastBay().shelves.length === SHELVES) {
          mine.push({ key: `${category}-${mine.length + 1}`, category, part: mine.length + 1, shelves: [], count: 0 });
        }
        lastBay().shelves.push({ spines: [], free: BAY_INNER });
      };

      newShelf();
      // 책장 하나에 다 들어가면 선반마다 고르게 나눠 꽂아요 (서점 진열처럼). 넘치면 폭이 찰 때까지 채워요.
      const totalWidth = rest.reduce((n, b) => n + dims(b).t + 3, 0);
      const fitsOneBay = totalWidth <= BAY_INNER * SHELVES * 0.9;
      const slots = rest.length;
      const perShelf = Math.max(3, Math.ceil(slots / SHELVES));
      const used = (s: Shelf) => s.spines.length;
      rest.forEach((b) => {
        const need = dims(b).t + 3;
        if (lastShelf().free < need || (fitsOneBay && used(lastShelf()) >= perShelf)) newShelf();
        lastShelf().spines.push(b);
        lastShelf().free -= need;
        lastBay().count += 1;
      });
      while (lastBay().shelves.length < SHELVES) lastBay().shelves.push({ spines: [], free: BAY_INNER });
      bays.push(...mine);
    });

  // 선반의 작은 상태 카드
  bays.forEach((bay) => {
    const all = bay.shelves.flatMap((s) => s.spines);
    const finished = all.filter((b) => b.status === "finished").length;
    const want = all.filter((b) => b.status === "want").length;
    const lastFilled = bay.shelves.reduce((last, s, i) => (s.spines.length ? i : last), -1);
    bay.shelves.forEach((shelf, i) => {
      if (i === lastFilled && i > 0) {
        if (finished > 0) shelf.pop = `다 읽은 책 ${finished}권 ✓`;
        else if (want > 0) shelf.pop = `읽고 싶은 책 ${want}권`;
      }
      if (shelf.pop && shelf.free < 120) shelf.pop = undefined;

    });
  });
  return bays;
}

export default function BookstoreShelf({ books, variant = "store", onAdd }: Props) {
  const bays = useMemo(() => buildBays(books), [books]);
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // 지금 보고 있는 책장 번호 (좌우로 넘길 때 갱신) + 넘기면 꺼낸 책은 제자리로
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 2);
      const bay = el.querySelector<HTMLElement>(".bs-bay");
      const step = bay ? bay.offsetWidth + 14 : 1;
      const next = Math.min(bays.length - 1, Math.round(el.scrollLeft / step));
      setIndex((prev) => {
        if (prev !== next) setSelected(null);
        return next;
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => { el.removeEventListener("scroll", update); observer.disconnect(); };
  }, [bays.length]);

  // 책장 바깥을 누르면 꺼낸 책을 다시 꽂아요
  useEffect(() => {
    const dismiss = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setSelected(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  const go = (to: number) => {
    const el = scroller.current;
    const bay = el?.querySelector<HTMLElement>(".bs-bay");
    if (!el || !bay) return;
    el.scrollTo({ left: to * (bay.offsetWidth + 14), behavior: "smooth" });
  };

  // Navigation belongs to the explicit actions; the book itself only toggles selection.
  const tap = (book: ShelfBook) => setSelected((id) => id === book.id ? null : book.id);

  const active = books.find((b) => b.id === selected);

  const renderBook = (b: ShelfBook) => {
    const d = dims(b);
    const isSelected = selected === b.id;
    const object = (
      <span className="bs-obj" aria-hidden>
        <span className="bs-f bs-f-back" />
        <span className="bs-f bs-f-pages" />
        <span className="bs-f bs-f-top" />
        <span className="bs-f bs-f-spine">
          <span className="bs-bands" />
          <span
            className="bs-title"
            style={{ fontSize: `calc(${Math.min(11.5, Math.max(7.5, (d.h - 38) / Array.from(b.title).length))}px * var(--k))` }}
          >
            {Array.from(b.title).length > 14 ? Array.from(b.title).slice(0, 13).join("") + "…" : b.title}
          </span>
          <span className="bs-author">{b.author.split(",")[0].split(" ").pop()}</span>
          {b.status === "reading" && <span className="bs-ribbon" />}
        </span>
        <span className="bs-f bs-f-front">
          <BookCover book={b} className="h-full w-full" />
        </span>
      </span>
    );
    return (
      <button
        key={b.id}
        type="button"
        onClick={() => tap(b)}
        className={`bs-slot ${isSelected ? "is-selected" : ""}`}
        style={
          {
            "--h": `${d.h}px`,
            "--bw": `${d.bw}px`,
            "--t": `${d.t}px`,
            "--bg": b.cover.bg,
            "--ink": b.cover.ink,
          } as React.CSSProperties
        }
        aria-label={`${b.title}, ${b.author}. ${isSelected ? "다시 누르면 꽂기" : "눌러서 꺼내 보기"}`}
        aria-pressed={isSelected}
        aria-expanded={isSelected}
        onKeyDown={(e) => { if (e.key === "Escape") setSelected(null); }}
      >

        {isSelected ? <BookMorph id={b.id}>{object}</BookMorph> : object}
      </button>
    );
  };

  const caption = (
    <div className="bs-caption" aria-live="polite">
      {active ? (
        <p>
          <b>{active.title}</b>
          <span>
            {active.author} · {statusText[active.status]}
            {active.status === "reading" && ` · ${active.currentPage}/${active.totalPages}쪽`}
          </span>
          <em>책을 다시 누르면 꽂혀요</em>
        </p>
      ) : (
        <p>
          <span>책을 누르면 꺼내 볼 수 있어요</span>
        </p>
      )}
      {variant === "store" && bays.length > 1 && (
        <div className="flex items-center gap-3">
          <div className="bs-dots" aria-hidden>
            {bays.map((b, i) => (
              <i key={b.key} className={i === index ? "on" : ""} />
            ))}
          </div>
          <button type="button" className="bs-arrow" aria-label="이전 책장" disabled={index === 0} onClick={() => go(index - 1)}>
            ←
          </button>
          <button type="button" className="bs-arrow" aria-label="다음 책장" disabled={atEnd} onClick={() => go(index + 1)}>
            →
          </button>
        </div>
      )}
    </div>
  );

  if (variant === "strip") {
    return (
      <div ref={root} className="bs-store bs-strip-wrap">
        <div className="bs-bay bs-strip">
          <div className="bs-crown" aria-hidden />
          <div className="no-scrollbar overflow-x-auto">
            <div className={`bs-shelf ${active ? "has-selection" : ""}`}>
              <span className="bs-lamp" aria-hidden />
              {books.map((b) => renderBook(b))}
              {active && <ShelfInfo book={active} />}
            </div>
          </div>
          <div className="bs-board" aria-hidden />
          <div className="bs-plinth" aria-hidden />
        </div>
        {caption}
      </div>
    );
  }

  if (bays.length === 0) return null;

  return (
    <div ref={root} className="bs-store">
      <div ref={scroller} className="bs-scroller no-scrollbar" role="group" aria-label="책장. 좌우로 넘겨 보세요">
        {bays.map((bay) => {
          const many = bays.filter((b) => b.category === bay.category).length > 1;
          const firstEmpty = bay.shelves.findIndex((s) => s.spines.length === 0);
          return (
            <section key={bay.key} className="bs-bay" aria-label={`${bay.category} 책장`}>
              <div className="bs-crown">
                <p className="bs-plate">
                  {bay.category}
                  {many && ` ${bay.part}`}
                  <span>{bay.count}</span>
                </p>
              </div>
              {bay.shelves.map((shelf, i) => (
                <div key={i} className="bs-compartment">
                  <div className={`bs-shelf ${shelf.spines.some((b) => b.id === selected) ? "has-selection" : ""}`}>
                    <span className="bs-lamp" aria-hidden />
                    {shelf.spines.map((b) => renderBook(b))}
                    {active && shelf.spines.some((b) => b.id === active.id) && <ShelfInfo book={active} />}
                    <span className="bs-ghosts" aria-hidden="true">
                      {Array.from({ length: Math.max(0, Math.floor((shelf.free - 15) / 23)) }, (_, j) => <i key={j} style={{ height: `${75 + (j * 17 + i * 11) % 31}px`, width: `${14 + (j * 7) % 9}px` }} />)}
                    </span>
                    {onAdd && i === firstEmpty && (
                      <button type="button" className="bs-empty" onClick={onAdd}>
                        + 여기에 다음 책 꽂기
                      </button>
                    )}
                    {shelf.pop && <span className="bs-pop">{shelf.pop}</span>}
                  </div>
                  <div className="bs-board" aria-hidden />
                </div>
              ))}
              <div className="bs-plinth" aria-hidden />
            </section>
          );
        })}
      </div>
      {caption}
    </div>
  );
}

function ShelfInfo({ book }: { book: ShelfBook }) {
  const date = book.lastReadAt ? new Date(book.lastReadAt) : null;
  const lastRead = date && !Number.isNaN(date.valueOf())
    ? new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", timeZone: "Asia/Seoul" }).format(date)
    : "아직 기록 없음";
  const readHref = book.readHref ?? `${book.href}/read`;
  return <div className="bs-info" role="region" aria-label={`${book.title} 책 정보`} onKeyDown={(e) => { if (e.key === "Escape") e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(".is-selected")?.click(); }}>
    <p className="bs-info-status">{statusText[book.status]}</p>
    <h3>{book.title}</h3>
    <p className="bs-info-author">{book.author}</p>
    <dl><div><dt>마지막 독서</dt><dd>{lastRead}</dd></div><div><dt>읽은 쪽</dt><dd>{book.currentPage} / {book.totalPages}</dd></div></dl>
    <div className="bs-info-actions"><Link href={readHref}>읽기</Link><Link href={book.href}>상세 정보</Link></div>
  </div>;
}

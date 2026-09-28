"use client";
// ─────────────────────────────────────────────────────────────
// 편집숍 서가 (디자인 C)
//
// - 카테고리 하나 = 책장 하나. 책장 안에서는 선반 4칸이 위아래로 쌓여요.
//   한 책장이 가득 차면 같은 카테고리의 다음 책장이 오른쪽에 이어지고, 책장끼리는 좌우로 넘겨요.
// - 책은 진짜 3D 오브젝트(표지·책등·윗면·종이 면)예요. 책등이 보이게 꽂혀 있다가
//   한 번 누르면 옆 책들이 비켜나며 표지 쪽으로 돌아 나오고, 한 번 더 누르면 열려요.
// - 맨 윗칸에는 "지금 읽는 책"을 표지가 보이게 세워 두고, 빈 곳에는 눕혀 둔 책·화분 같은 소품을 놓아요.
// ─────────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";
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

type Decor = { kind: "stack" | "plant" | "bookend"; seed: number };
type Shelf = { face?: ShelfBook; spines: ShelfBook[]; free: number; decor: Decor[]; pop?: string };
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
      const face = sorted.find((b) => b.status === "reading");
      const rest = sorted.filter((b) => b !== face);
      const mine: Bay[] = [];
      const lastBay = () => mine[mine.length - 1];
      const lastShelf = () => lastBay().shelves[lastBay().shelves.length - 1];
      const newShelf = () => {
        if (mine.length === 0 || lastBay().shelves.length === SHELVES) {
          mine.push({ key: `${category}-${mine.length + 1}`, category, part: mine.length + 1, shelves: [], count: 0 });
        }
        lastBay().shelves.push({ spines: [], free: BAY_INNER, decor: [] });
      };

      newShelf();
      if (face) {
        lastShelf().face = face;
        lastShelf().free -= dims(face).bw + 12;
        lastBay().count += 1;
      }
      // 책장 하나에 다 들어가면 선반마다 고르게 나눠 꽂아요 (서점 진열처럼). 넘치면 폭이 찰 때까지 채워요.
      const totalWidth = rest.reduce((n, b) => n + dims(b).t + 3, face ? dims(face).bw + 12 : 0);
      const fitsOneBay = totalWidth <= BAY_INNER * SHELVES * 0.9;
      const slots = rest.length + (face ? 2 : 0);
      const perShelf = Math.max(3, Math.ceil(slots / SHELVES));
      const used = (s: Shelf) => s.spines.length + (s.face ? 2 : 0);
      rest.forEach((b) => {
        const need = dims(b).t + 3;
        if (lastShelf().free < need || (fitsOneBay && used(lastShelf()) >= perShelf)) newShelf();
        lastShelf().spines.push(b);
        lastShelf().free -= need;
        lastBay().count += 1;
      });
      while (lastBay().shelves.length < SHELVES) lastBay().shelves.push({ spines: [], free: BAY_INNER, decor: [] });
      bays.push(...mine);
    });

  // POP 카드와 소품 배치
  bays.forEach((bay) => {
    const all = bay.shelves.flatMap((s) => [...(s.face ? [s.face] : []), ...s.spines]);
    const finished = all.filter((b) => b.status === "finished").length;
    const want = all.filter((b) => b.status === "want").length;
    const lastFilled = bay.shelves.reduce((last, s, i) => (s.face || s.spines.length ? i : last), -1);
    bay.shelves.forEach((shelf, i) => {
      if (shelf.face) {
        const f = shelf.face;
        shelf.pop = `${f.currentPage}쪽까지 읽었어요\n${Math.max(0, f.totalPages - f.currentPage)}쪽 남음`;
      } else if (i === lastFilled && i > 0) {
        if (finished > 0) shelf.pop = `다 읽은 책 ${finished}권 ✓`;
        else if (want > 0) shelf.pop = `읽고 싶은 책 ${want}권`;
      }
      if (shelf.pop && shelf.free < 120) shelf.pop = undefined;
      const seed = seedOf(`${bay.key}-${i}`);
      const room = shelf.free - (shelf.pop ? 124 : 0);
      if (shelf.spines.length > 0 && room > 30) shelf.decor.push({ kind: "bookend", seed });
      if (room > 110) {
        const first = seed % 3 === 0 ? "plant" : "stack";
        shelf.decor.push({ kind: first, seed });
        // 빈 선반에는 소품을 하나 더 (앞의 것과 다른 종류로)
        if (!shelf.face && shelf.spines.length === 0 && room > 200) {
          shelf.decor.push({ kind: first === "plant" ? "stack" : "plant", seed: seed + 7 });
        }
      }
    });
  });
  return bays;
}

export default function BookstoreShelf({ books, variant = "store", onAdd }: Props) {
  const bays = useMemo(() => buildBays(books), [books]);
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [entering, setEntering] = useState<string | null>(null);
  const router = useRouter();

  // 지금 보고 있는 책장 번호 (좌우로 넘길 때 갱신) + 넘기면 꺼낸 책은 제자리로
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
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
    return () => el.removeEventListener("scroll", update);
  }, [bays.length]);

  // 책장 바깥을 누르면 꺼낸 책을 다시 꽂아요
  useEffect(() => {
    const dismiss = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setSelected(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const go = (to: number) => {
    const el = scroller.current;
    const bay = el?.querySelector<HTMLElement>(".bs-bay");
    if (!el || !bay) return;
    el.scrollTo({ left: to * (bay.offsetWidth + 14), behavior: "smooth" });
  };

  // 첫 번째 누름: 꺼내서 표지 보기 / 두 번째 누름: 열기
  const tap = (book: ShelfBook) => {
    if (entering) return;
    if (selected !== book.id) {
      setSelected(book.id);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEntering(book.id);
    timer.current = setTimeout(() => router.push(book.href), reduce ? 0 : 360);
  };

  const active = books.find((b) => b.id === selected);

  const renderBook = (b: ShelfBook, displayed = false) => {
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
        className={`bs-slot ${displayed ? "is-displayed" : ""} ${isSelected ? "is-selected" : ""} ${entering === b.id ? "is-entering" : ""}`}
        style={
          {
            "--h": `${d.h}px`,
            "--bw": `${d.bw}px`,
            "--t": `${d.t}px`,
            "--bg": b.cover.bg,
            "--ink": b.cover.ink,
          } as React.CSSProperties
        }
        aria-label={`${b.title}, ${b.author}. ${isSelected ? "한 번 더 누르면 열려요" : "눌러서 꺼내 보기"}`}
        aria-pressed={isSelected}
      >
        {displayed && <span className="bs-face-label">지금 읽는 중</span>}
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
          <em>한 번 더 누르면 열려요</em>
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
          <button type="button" className="bs-arrow" aria-label="다음 책장" disabled={index >= bays.length - 1} onClick={() => go(index + 1)}>
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
            <div className="bs-shelf">
              <span className="bs-lamp" aria-hidden />
              {books.map((b) => renderBook(b))}
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
          const firstEmpty = bay.shelves.findIndex((s) => !s.face && s.spines.length === 0);
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
                  <div className="bs-shelf">
                    <span className="bs-lamp" aria-hidden />
                    {shelf.face && renderBook(shelf.face, true)}
                    {shelf.spines.map((b) => renderBook(b))}
                    {shelf.decor.map((d, j) => (
                      <DecorPiece key={j} decor={d} />
                    ))}
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

// 선반 위 소품: 눕혀 쌓은 책 · 작은 화분 · 북엔드
const stackColors = ["#6d5a4a", "#3f4b45", "#8c7457", "#54505e", "#9a8a6c", "#5b3f35", "#44535f"];
function DecorPiece({ decor }: { decor: Decor }) {
  if (decor.kind === "bookend") return <span className="bs-bookend" aria-hidden />;
  if (decor.kind === "plant") {
    return (
      <span className="bs-plant" aria-hidden>
        <svg viewBox="0 0 40 56" width="100%" height="100%">
          <path d="M20 34 C18 22 10 18 5 12 C13 14 18 20 20 30 Z" fill="#5d7a4f" />
          <path d="M20 34 C22 20 30 14 36 8 C30 18 24 24 21 32 Z" fill="#6f8f5c" />
          <path d="M20 34 C20 24 17 14 19 4 C23 14 22 24 21 34 Z" fill="#4f6b44" />
          <path d="M8 34 H32 L29 55 H11 Z" fill="#b8835e" />
          <path d="M7 32 H33 V36 H7 Z" fill="#c99670" />
        </svg>
      </span>
    );
  }
  const count = 2 + (decor.seed % 3);
  return (
    <span className="bs-stack" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: `${54 + ((decor.seed >> (i * 3)) % 26)}px`,
            marginLeft: `${((decor.seed >> (i * 2)) % 7) - 3}px`,
            background: stackColors[(decor.seed + i * 3) % stackColors.length],
          }}
        />
      ))}
    </span>
  );
}

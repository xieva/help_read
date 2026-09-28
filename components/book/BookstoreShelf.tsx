"use client";
// ─────────────────────────────────────────────────────────────
// 편집숍 서가 (디자인 C)
//
// - 카테고리 하나 = 책장 하나. 책장 안에서는 선반 4칸이 위아래로 쌓여요.
// - 한 책장이 가득 차면 같은 카테고리의 다음 책장이 오른쪽에 이어집니다.
// - 책장끼리는 좌우로 넘겨요. (페이지를 위아래로 길게 스크롤하지 않아도 돼요)
// - 책은 책등이 보이게 꽂혀 있고, 윗면(종이)과 옆면(표지 두께)이 살짝 보여 두께가 느껴져요.
// - 맨 윗칸에는 "지금 읽는 책"을 표지가 보이게 세워 둡니다.
// ─────────────────────────────────────────────────────────────

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { BookStatus, Cover } from "@/data/books";
import BookCover from "./BookCover";

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
  variant?: "store" | "strip"; // store: 책장 여러 개 / strip: 선반 한 줄(홈 등)
  onAdd?: () => void; // 빈 선반의 "+ 여기에 다음 책 꽂기"
};

const BAY_INNER = 298; // 책장 안쪽 너비(px). 모든 책장이 같은 크기라 서점처럼 가지런해요.
const SHELVES = 4;
const FACE_W = 74; // 표지가 보이게 세운 책의 너비

// 장르 이름을 서가 카테고리로 묶어요 (예: "역사 · 인문" → 인문)
export function shelfCategory(genre: string): string {
  const first = genre.split("·")[0].trim();
  if (["인문", "역사", "철학", "사회", "심리"].includes(first)) return "인문";
  if (first === "경제" || first === "경영") return "경제·경영";
  return first || "미분류";
}

function spineWidth(b: ShelfBook) {
  return Math.round(Math.min(40, Math.max(22, b.totalPages / 16)));
}
function spineHeight(b: ShelfBook) {
  // 책마다 키가 조금씩 달라요. cover.size 가 없으면 제목으로 일정하게 정해요.
  const seed = Array.from(b.title).reduce((n, c) => n + c.charCodeAt(0), 0);
  const size = b.cover.size ?? 0.9 + (seed % 20) / 100;
  return Math.round(104 * Math.min(1.12, Math.max(0.86, size)));
}

type Shelf = { face?: ShelfBook; spines: ShelfBook[]; free: number };
type Bay = { category: string; part: number; shelves: Shelf[]; count: number; reading: number; finished: number; want: number };

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
          mine.push({ category, part: mine.length + 1, shelves: [], count: 0, reading: 0, finished: 0, want: 0 });
        }
        lastBay().shelves.push({ spines: [], free: BAY_INNER });
      };
      const track = (b: ShelfBook) => {
        lastBay().count += 1;
        lastBay()[b.status] += 1;
      };

      newShelf();
      if (face) {
        lastShelf().face = face;
        lastShelf().free -= FACE_W + 10;
        track(face);
      }
      // 책장 하나에 다 들어가면 선반마다 고르게 나눠 꽂아요 (서점 진열처럼). 넘치면 폭이 찰 때까지 채워요.
      const totalWidth = rest.reduce((n, b) => n + spineWidth(b) + 3, face ? FACE_W + 10 : 0);
      const fitsOneBay = totalWidth <= BAY_INNER * SHELVES * 0.9;
      const slots = rest.length + (face ? 2 : 0);
      const perShelf = Math.max(3, Math.ceil(slots / SHELVES));
      const used = (shelf: Shelf) => shelf.spines.length + (shelf.face ? 2 : 0);
      rest.forEach((b) => {
        const need = spineWidth(b) + 3;
        if (lastShelf().free < need || (fitsOneBay && used(lastShelf()) >= perShelf)) newShelf();
        lastShelf().spines.push(b);
        lastShelf().free -= need;
        track(b);
      });
      // 빈 선반까지 채워서 책장 모양을 맞춰요
      while (lastBay().shelves.length < SHELVES) lastBay().shelves.push({ spines: [], free: BAY_INNER });
      bays.push(...mine);
    });
  return bays;
}

// 선반 위에 붙이는 손글씨 POP 카드 문구
// - 지금 읽는 책이 있는 선반: 어디까지 읽었는지
// - 책이 꽂힌 마지막 선반: 이 책장의 다 읽은 책 / 읽고 싶은 책 수
function popText(bay: Bay, shelf: Shelf, index: number): string | null {
  if (shelf.face) {
    const f = shelf.face;
    return `${f.currentPage}쪽까지 읽었어요\n${Math.max(0, f.totalPages - f.currentPage)}쪽 남음`;
  }
  const lastFilled = bay.shelves.reduce((last, x, i) => (x.face || x.spines.length ? i : last), -1);
  if (index !== lastFilled || index === 0) return null;
  if (bay.finished > 0) return `다 읽은 책 ${bay.finished}권 ✓`;
  if (bay.want > 0) return `읽고 싶은 책 ${bay.want}권`;
  return null;
}

export default function BookstoreShelf({ books, variant = "store", onAdd }: Props) {
  const bays = useMemo(() => buildBays(books), [books]);
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [pulled, setPulled] = useState<string | null>(null);
  const router = useRouter();

  // 지금 보고 있는 책장 번호 (좌우로 넘길 때 갱신)
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      const bay = el.querySelector<HTMLElement>(".bs-bay");
      const step = bay ? bay.offsetWidth + 14 : 1;
      setIndex(Math.min(bays.length - 1, Math.round(el.scrollLeft / step)));
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [bays.length]);

  const go = (to: number) => {
    const el = scroller.current;
    const bay = el?.querySelector<HTMLElement>(".bs-bay");
    if (!el || !bay) return;
    el.scrollTo({ left: to * (bay.offsetWidth + 14), behavior: "smooth" });
  };

  // 책을 누르면 살짝 꺼내는 움직임 뒤에 상세로 이동해요
  const open = (book: ShelfBook) => {
    if (pulled) return;
    setPulled(book.id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => router.push(book.href), reduce ? 0 : 230);
  };

  const renderSpine = (b: ShelfBook) => (
    <button
      key={b.id}
      type="button"
      onClick={() => open(b)}
      className={`bs-book ${pulled === b.id ? "is-pulled" : ""}`}
      style={
        {
          "--w": `${spineWidth(b)}px`,
          "--h": `${spineHeight(b)}px`,
          "--bg": b.cover.bg,
          "--ink": b.cover.ink,
        } as React.CSSProperties
      }
      aria-label={`${b.title}, ${b.author}`}
    >
      <span className="bs-top" aria-hidden />
      <span className="bs-side" aria-hidden />
      <span className="bs-spine" aria-hidden>
        <span className="bs-bands" />
        <span className="bs-title" style={{ fontSize: `calc(${Math.min(11.5, Math.max(7.5, (spineHeight(b) - 36) / Array.from(b.title).length))}px * var(--k))` }}>
          {Array.from(b.title).length > 14 ? Array.from(b.title).slice(0, 13).join("") + "…" : b.title}
        </span>
        <span className="bs-author">{b.author.split(",")[0].split(" ").pop()}</span>
      </span>
      {b.status === "reading" && <span className="bs-ribbon" aria-hidden />}
    </button>
  );

  if (variant === "strip") {
    return (
      <div className="bs-store bs-strip">
        <div className="no-scrollbar overflow-x-auto">
          <div className="bs-shelf">
            <span className="bs-lamp" aria-hidden />
            {books.map(renderSpine)}
          </div>
        </div>
        <div className="bs-board" aria-hidden />
      </div>
    );
  }

  if (bays.length === 0) return null;
  const current = bays[index] ?? bays[0];

  return (
    <div className="bs-store">
      <div className="bs-head">
        <p>
          <b>
            {current.category}
            {bays.filter((b) => b.category === current.category).length > 1 && ` ${current.part}`}
          </b>
          <span>{current.count}권</span>
        </p>
        <div className="flex items-center gap-3">
          <div className="bs-dots" aria-hidden>
            {bays.map((b, i) => (
              <i key={`${b.category}-${b.part}`} className={i === index ? "on" : ""} />
            ))}
          </div>
          <button type="button" className="bs-arrow" aria-label="이전 책장" disabled={index === 0} onClick={() => go(index - 1)}>
            ←
          </button>
          <button
            type="button"
            className="bs-arrow"
            aria-label="다음 책장"
            disabled={index >= bays.length - 1}
            onClick={() => go(index + 1)}
          >
            →
          </button>
        </div>
      </div>

      <div ref={scroller} className="bs-scroller no-scrollbar" role="group" aria-label="책장. 좌우로 넘겨 보세요">
        {bays.map((bay) => (
          <section key={`${bay.category}-${bay.part}`} className="bs-bay" aria-label={`${bay.category} 책장`}>
            <p className="bs-plate">{bay.category}</p>
            {bay.shelves.map((shelf, i) => {
              const pop = popText(bay, shelf, i);
              const empty = !shelf.face && shelf.spines.length === 0;
              return (
                <div key={i} className="bs-compartment">
                  <div className="bs-shelf">
                    <span className="bs-lamp" aria-hidden />
                    {shelf.face && (
                      <button type="button" className={`bs-face ${pulled === shelf.face.id ? "is-pulled" : ""}`} onClick={() => open(shelf.face!)} aria-label={`지금 읽는 중: ${shelf.face.title}`}>
                        <span className="bs-face-label">지금 읽는 중</span>
                        <BookCover book={shelf.face} className="bs-face-cover" />
                      </button>
                    )}
                    {shelf.spines.map(renderSpine)}
                    {empty && onAdd && i === bay.shelves.findIndex((x) => !x.face && x.spines.length === 0) && (
                      <button type="button" className="bs-empty" onClick={onAdd}>
                        + 여기에 다음 책 꽂기
                      </button>
                    )}
                    {pop && shelf.free > 96 && <span className="bs-pop">{pop}</span>}
                  </div>
                  <div className="bs-board" aria-hidden />
                </div>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

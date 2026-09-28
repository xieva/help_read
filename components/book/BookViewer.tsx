"use client";
// ─────────────────────────────────────────────────────────────
// 만져볼 수 있는 책 (상세 화면)
// - 좌우로 밀면 책이 돌아가요. 끝까지 돌리면 뒷면도 보여요.
// - 책을 누르면 표지부터 종이가 촤라락 끝까지 넘어가서 "뒷면"이 나와요. 다시 누르면 앞으로 돌아와요.
// - 위로 삐죽 나온 책갈피를 누르면 읽던 쪽이 펼쳐져요.
//
// 구조: 모든 장(앞표지 · 종이들 · 뒤표지)이 책등(왼쪽 모서리)을 축으로 도는 경첩이에요.
//       장마다 두께 방향 위치(z)가 달라서, 끝까지 넘기면 자연스럽게 뒤표지가 맨 위에 와요.
// ─────────────────────────────────────────────────────────────

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRef, useState } from "react";
import BookCover, { type CoverBook } from "./BookCover";
import BookMorph from "./BookMorph";
import CatalogCoverArt from "./CatalogCoverArt";
import { matchCatalogBook } from "@/lib/catalog";
import { BookmarkArt, type BookmarkId } from "./Bookmark";

export type ViewerBook = CoverBook & {
  totalPages: number;
  currentPage: number;
  status?: string;
  description?: string;
  publisher?: string;
  coverBackImage?: string;
};

type Mode = "front" | "open" | "back";
type Props = {
  book: ViewerBook;
  bookmark?: BookmarkId; // 책갈피 무늬. 읽는 중인 책에만 보여요
  morphId?: string; // 서재에서 꺼낸 책이 이 자리로 이어지게 (화면 전환)
  className?: string; // 크기: "[--w:164px] md:[--w:220px]"
};

const LEAVES = 18; // 넘어가는 종이 장 수
const REST = 18; // 가만히 있을 때 기울기 (책등이 살짝 보이게)
const STEP = 0.045; // 장과 장 사이 시간 간격 (초)
const SHEET = 0.5; // 종이 한 장이 넘어가는 시간
const COVER = 0.75; // 표지가 넘어가는 시간

export default function BookViewer({ book, bookmark, morphId, className = "" }: Props) {
  const reduce = useReducedMotion();
  const ry = useMotionValue(REST);
  const rx = useMotionValue(0);
  const shift = useMotionValue(0); // 책 너비의 몇 %만큼 오른쪽으로 옮길지 (펼치면 50, 뒷면이면 100)
  const shiftX = useTransform(shift, (n) => `${n}%`);
  // 도는 중심: 지금 눈에 보이는 책의 한가운데 (뒷면일 땐 종이가 왼쪽으로 넘어가 있어서 중심도 함께 옮겨요)
  const pivot = useTransform(shift, (n) => `${50 - n}% 50%`);
  const [mode, setMode] = useState<Mode>("front");
  const [prev, setPrev] = useState<Mode>("front");
  const drag = useRef<{ x: number; start: number; moved: boolean; id: number; onMark: boolean } | null>(null);

  const thickness = 0.035 + Math.min(book.totalPages, 900) / 9000;
  const hasMark = Boolean(bookmark) && book.status === "reading" && book.currentPage > 0;
  // 책갈피가 꽂힌 종이 (전체 쪽수 중 읽은 비율만큼)
  const k = Math.min(LEAVES - 1, Math.max(1, Math.round((book.currentPage / Math.max(1, book.totalPages)) * LEAVES)));

  // 모드별로 각 장이 몇 도 넘어가 있는지. 0: 앞표지, 1..LEAVES: 종이, LEAVES+1: 뒤표지
  const angleFor = (m: Mode, pos: number) => {
    if (m === "back") return -180;
    if (m === "open") return pos <= k ? -180 : 0; // 앞표지~책갈피 앞 장까지 넘김
    return 0;
  };
  // 넘기는 순서대로 조금씩 늦게 출발해요 (앞으로 넘길 땐 앞장부터, 되돌릴 땐 뒷장부터)
  const delayFor = (pos: number) => {
    const total = LEAVES + 2;
    const changed = Array.from({ length: total }, (_, p) => p).filter((p) => angleFor(prev, p) !== angleFor(mode, p));
    if (!changed.includes(pos) || reduce) return 0;
    const forward = angleFor(mode, pos) < angleFor(prev, pos);
    return forward ? (pos - Math.min(...changed)) * STEP : (Math.max(...changed) - pos) * STEP;
  };

  const go = (next: Mode) => {
    if (next === mode) return;
    const changedCount = Array.from({ length: LEAVES + 2 }, (_, p) => p).filter((p) => angleFor(mode, p) !== angleFor(next, p)).length;
    const total = reduce ? 0 : changedCount * STEP + COVER;
    setPrev(mode);
    setMode(next);
    const ease = [0.45, 0.05, 0.3, 1] as const;
    animate(ry, next === "front" ? REST : next === "back" ? -REST : 0, { duration: total * 0.8, ease });
    animate(rx, next === "open" ? 14 : 0, { duration: total * 0.8, ease });
    animate(shift, next === "front" ? 0 : next === "open" ? 50 : 100, { duration: total, ease });
  };

  const tapBook = () => go(mode === "front" ? "back" : "front");
  const tapMark = () => go(mode === "open" ? "front" : "open");

  const onPointerDown = (e: React.PointerEvent) => {
    const onMark = Boolean((e.target as HTMLElement).closest(".bv-mark"));
    drag.current = { x: e.clientX, start: ry.get(), moved: false, id: e.pointerId, onMark };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* 캡처가 안 돼도 돌리기는 그대로 동작해요 */
      }
    }
    ry.set(Math.max(-200, Math.min(200, d.start + dx * 0.55)));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || d.moved) return;
    if (d.onMark) tapMark();
    else tapBook();
  };

  const hinge = (pos: number) => ({
    initial: false as const,
    animate: { rotateY: angleFor(mode, pos) },
    transition: {
      duration: reduce ? 0 : pos === 0 || pos === LEAVES + 1 ? COVER : SHEET,
      delay: delayFor(pos),
      ease: [0.3, 0.6, 0.3, 1] as const,
    },
  });
  // 두께 방향 위치: 앞표지(+t/2) → 종이들 → 뒤표지(-t/2)
  const z = (pos: number) => `calc(var(--t) * ${(0.5 - pos / (LEAVES + 1)).toFixed(4)})`;
  const page = Math.max(1, book.currentPage);

  const hint =
    mode === "open"
      ? `${page}쪽 · 여기서부터 이어 읽어요`
      : mode === "back"
        ? "뒷면이에요 · 누르면 다시 앞으로 넘겨져요"
        : hasMark
          ? "누르면 뒷면까지 · 책갈피를 누르면 읽던 곳"
          : "밀어서 돌려보고, 누르면 뒷면까지 넘겨져요";

  const stageEl = () => (
    <div
      className="bv-stage"
      role="button"
      tabIndex={0}
      aria-label={`${book.title}. 누르면 뒷면까지 넘겨져요${hasMark ? ". 책갈피로 읽던 쪽을 펼칠 수 있어요" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          tapBook();
        }
        if (e.key === "b" && hasMark) tapMark();
        if (e.key === "ArrowLeft") animate(ry, ry.get() - 25, { duration: 0.3 });
        if (e.key === "ArrowRight") animate(ry, ry.get() + 25, { duration: 0.3 });
      }}
      style={{ "--t": `calc(var(--w) * ${thickness.toFixed(3)})` } as React.CSSProperties}
    >
      <div className="bv-shadow" aria-hidden />
      <motion.div className="bv-body" style={{ rotateY: ry, rotateX: rx, x: shiftX, transformOrigin: pivot }}>
        {/* 책등: 가운데쯤 장과 함께 돌아요 */}
        <motion.div className="bv-spine-hinge" {...hinge(Math.ceil(LEAVES / 2))}>
          <div className="bv-spine" style={{ background: `color-mix(in oklab, ${book.cover.bg} 78%, black)` }} />
        </motion.div>

        {/* 앞표지 */}
        <motion.div className="bv-hinge" {...hinge(0)}>
          <div className="bv-sheet" style={{ transform: `translateZ(${z(0)})` }}>
            <div className="bv-face bv-cover-out">
              <BookCover book={book} className="h-full w-full" />
            </div>
            <div className="bv-face bv-back-face bv-endpaper" style={{ background: `color-mix(in oklab, ${book.cover.bg} 28%, #efe6d4)` }} />
          </div>
        </motion.div>

        {/* 종이들 */}
        {Array.from({ length: LEAVES }, (_, i) => {
          const pos = i + 1;
          return (
            <motion.div key={pos} className="bv-hinge bv-leaf-hinge" {...hinge(pos)}>
              <div className="bv-sheet bv-leaf" style={{ transform: `translateZ(${z(pos)})` }}>
                <div className="bv-face bv-paper">{hasMark && pos === k + 1 && <PageText page={page} marker />}</div>
                <div className="bv-face bv-back-face bv-paper is-left">{hasMark && pos === k && <PageText page={page - 1} left />}</div>
              </div>
              {/* 책갈피: 읽던 쪽 종이 위에 놓여 함께 넘어가요 */}
              {hasMark && bookmark && pos === k + 1 && (
                <div className="bv-mark" style={{ transform: `translateZ(calc(${z(pos)} + var(--t) * 0.025))` }}>
                  <span className="bv-mark-cord" />
                  <BookmarkArt id={bookmark} />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* 뒤표지 */}
        <motion.div className="bv-hinge" {...hinge(LEAVES + 1)}>
          <div className="bv-sheet" style={{ transform: `translateZ(${z(LEAVES + 1)})` }}>
            <div className="bv-face bv-endpaper" style={{ background: `color-mix(in oklab, ${book.cover.bg} 28%, #efe6d4)` }} />
            <div className="bv-face bv-back-face bv-cover-out">
              <BookBack book={book} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  return (
    <div className={`bv ${className}`}>
      {morphId ? <BookMorph id={morphId}>{stageEl()}</BookMorph> : stageEl()}
      <p className="bv-hint">{hint}</p>
      <div className="bv-controls" role="group" aria-label="책 보기">
        <button type="button" aria-pressed={mode === "front"} onClick={() => go("front")}>
          앞면
        </button>
        {hasMark && (
          <button type="button" aria-pressed={mode === "open"} onClick={() => go("open")}>
            책갈피
          </button>
        )}
        <button type="button" aria-pressed={mode === "back"} onClick={() => go("back")}>
          뒷면
        </button>
      </div>
    </div>
  );
}

// 뒤표지: 실제 이미지(coverBackImage)가 있으면 이미지, 없으면 소개글 + 바코드로 그려요
function BookBack({ book }: { book: ViewerBook }) {
  const catalog = matchCatalogBook(book);
  const bg = `color-mix(in oklab, ${book.cover.bg} 90%, black)`;
  if (book.coverBackImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={book.coverBackImage} alt="" className="h-full w-full object-cover" />;
  }
  if (catalog && !book.coverImage) return <div className="relative h-full w-full @container"><CatalogCoverArt book={catalog} back /></div>;
  const blurb = book.description
    ? Array.from(book.description).length > 70
      ? Array.from(book.description).slice(0, 68).join("") + "…"
      : book.description
    : `“${book.title}”`;
  return (
    <div className="bv-back-art @container" style={{ background: bg, color: book.cover.ink }}>
      <p className="bv-back-title">{book.title}</p>
      <p className="bv-back-blurb">{blurb}</p>
      <div className="bv-back-foot">
        <span>{book.publisher || book.author}</span>
        <span className="bv-barcode" />
      </div>
    </div>
  );
}

// 종이 위의 글줄 (실제 책 문장 대신 선으로 표현해요)
function PageText({ page, marker = false, left = false }: { page: number; marker?: boolean; left?: boolean }) {
  const lines = [92, 100, 96, 88, 100, 94, 60, 0, 98, 100, 90, 97, 72];
  return (
    <div className={`bv-text ${left ? "is-left" : ""}`}>
      {lines.map((w, i) =>
        w === 0 ? <span key={i} className="bv-gap" /> : <span key={i} className="bv-line" style={{ width: `${w}%` }} />,
      )}
      {marker && <span className="bv-marker">여기서부터</span>}
      <span className="bv-num">{page}</span>
    </div>
  );
}

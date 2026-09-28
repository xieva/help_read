"use client";
// ─────────────────────────────────────────────────────────────
// 만져볼 수 있는 책 (상세 화면)
// - 좌우로 밀면 책이 돌아가요 (책등·종이 면이 보임)
// - 누르면 표지가 열리고 종이가 촤라락 넘어간 뒤, 읽던 쪽이 펼쳐져요
// - 다시 누르면 덮여요
// ─────────────────────────────────────────────────────────────

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useRef, useState } from "react";
import BookCover, { type CoverBook } from "./BookCover";

type Props = {
  book: CoverBook & { totalPages: number; currentPage: number };
  className?: string; // 크기: "[--w:176px] md:[--w:280px]"
};

const LEAVES = 9; // 넘어가는 종이 장 수
const REST_Y = 18; // 가만히 있을 때 기울기 (책등이 살짝 보이게)

export default function BookViewer({ book, className = "" }: Props) {
  const reduce = useReducedMotion();
  const ry = useMotionValue(REST_Y);
  const rx = useMotionValue(0);
  const shift = useMotionValue(0); // 펼칠 때 책 너비의 50%만큼 오른쪽으로 옮겨 가운데 맞추기
  const shiftX = useTransform(shift, (n) => `${n}%`);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ x: number; y: number; start: number; moved: boolean; id: number } | null>(null);

  const thickness = 0.035 + Math.min(book.totalPages, 900) / 9000;
  const spine = `color-mix(in oklab, ${book.cover.bg} 78%, black)`;
  const page = Math.max(1, book.currentPage);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    const t = { duration: reduce ? 0 : 0.7, ease: [0.25, 0.8, 0.25, 1] as const };
    animate(ry, next ? 0 : REST_Y, t);
    animate(rx, next ? 14 : 0, t);
    animate(shift, next ? 50 : 0, t);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, start: ry.get(), moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      try {
        // 손가락이 책 밖으로 나가도 계속 돌릴 수 있게
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* 캡처가 안 돼도 돌리기는 그대로 동작해요 */
      }
    }
    ry.set(Math.max(-80, Math.min(80, d.start + dx * 0.5)));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) toggle();
  };

  return (
    <div className={`bv ${className}`}>
      <div
        className="bv-stage"
        role="button"
        tabIndex={0}
        aria-pressed={open}
        aria-label={open ? `${book.title} 덮기` : `${book.title} 펼치기. 좌우로 밀면 돌아가요`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
          if (e.key === "ArrowLeft") animate(ry, Math.max(-80, ry.get() - 20), { duration: 0.3 });
          if (e.key === "ArrowRight") animate(ry, Math.min(80, ry.get() + 20), { duration: 0.3 });
        }}
        style={
          {
            "--t": `calc(var(--w) * ${thickness.toFixed(3)})`,
            "--spine": spine,
          } as React.CSSProperties
        }
      >
        <div className="bv-shadow" aria-hidden />
        <motion.div
          className="bv-body"
          style={{ rotateY: ry, rotateX: rx, x: shiftX }}
        >
          <div className="bv-back" />
          <div className="bv-spine" />
          <div className="bv-edge" />

          {/* 오른쪽 페이지: 읽던 쪽 */}
          <div className="bv-page bv-page-right">
            <PageText page={page} marker />
          </div>

          {/* 넘어가는 종이들 */}
          {Array.from({ length: LEAVES }, (_, i) => (
            // 바깥 div 는 높이(z) 를, 안쪽 motion.div 는 넘기는 회전을 맡아요
            <div key={i} className="bv-layer" style={{ "--z": `${0.6 + i * 0.35}px` } as React.CSSProperties}>
            <motion.div
              className="bv-leaf"
              initial={false}
              animate={{
                rotateY: open ? -178 + i * 0.15 : 0,
                opacity: open ? 1 : 0,
              }}
              transition={{
                rotateY: {
                  duration: reduce ? 0 : 0.55,
                  delay: reduce ? 0 : open ? 0.32 + i * 0.055 : (LEAVES - i) * 0.03,
                  ease: [0.3, 0.6, 0.3, 1],
                },
                opacity: { duration: 0.01, delay: reduce ? 0 : open ? 0.3 : 0.1 + LEAVES * 0.03 + 0.4 },
              }}
            >
              <div className="bv-face bv-leaf-front" />
              <div className="bv-face bv-leaf-back">{i === LEAVES - 1 && page > 1 && <PageText page={page - 1} left />}</div>
            </motion.div>
            </div>
          ))}

          {/* 표지 */}
          <div className="bv-layer" style={{ "--z": "0px" } as React.CSSProperties}>
          <motion.div
            className="bv-cover"
            initial={false}
            animate={{ rotateY: open ? -179 : 0 }}
            transition={{ duration: reduce ? 0 : 0.75, delay: reduce ? 0 : open ? 0 : LEAVES * 0.03 + 0.35, ease: [0.3, 0.7, 0.2, 1] }}
          >
            <div className="bv-face bv-cover-front">
              <BookCover book={book} className="h-full w-full" />
            </div>
            <div className="bv-face bv-cover-inside" />
          </motion.div>
          </div>
        </motion.div>
      </div>
      <p className="bv-hint">
        {open ? (book.currentPage > 0 ? `${page}쪽 · 여기서부터 이어 읽어요` : "첫 장부터 시작해요") : "좌우로 밀어서 돌려보고, 누르면 펼쳐져요"}
      </p>
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

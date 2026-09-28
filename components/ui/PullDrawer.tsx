"use client";
// ─────────────────────────────────────────────────────────────
// 당겨서 여는 서랍 (왼쪽)
// - 화면 왼쪽 가장자리에 손잡이(tab)가 삐죽 나와 있어요.
// - 손잡이를 오른쪽으로 끌거나 누르면 서랍이 따라 나오고, 왼쪽으로 밀거나 바깥을 누르면 들어가요.
// - 안에 무엇을 넣을지는 쓰는 쪽이 정해요 (children). 설정 메뉴의 바탕이에요.
// ─────────────────────────────────────────────────────────────

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  label: string; // 서랍 제목 (화면 읽기 프로그램용 + 맨 위 제목)
  handle: React.ReactNode; // 가장자리에 나와 있는 손잡이 모양
  children: React.ReactNode;
};

const SPRING = { type: "spring", damping: 32, stiffness: 340 } as const;

export default function PullDrawer({ label, handle, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(320);
  const x = useMotionValue(-320); // 서랍 위치: -width(닫힘) ~ 0(열림)
  const shade = useTransform(x, [-width, 0], [0, 1]);
  const drag = useRef<{ x: number; start: number; moved: boolean; id: number; t: number } | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const id = useId();

  // 서랍 너비는 화면에 맞춰요 (폰에서는 화면의 84%, 넓은 화면에서는 340px)
  useEffect(() => {
    setMounted(true);
    const measure = () => {
      const w = Math.round(Math.min(340, window.innerWidth * 0.84));
      setWidth(w);
      x.set(-w);
      setOpen(false);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [x]);

  const settle = (next: boolean) => {
    setOpen(next);
    animate(x, next ? 0 : -width, SPRING);
  };

  // 열려 있는 동안: Esc로 닫기, 서랍 안으로 포커스
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        animate(x, -width, SPRING);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, width, x]);

  // 손잡이와 서랍 어디를 잡아도 좌우로 끌 수 있어요
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, start: x.get(), moved: false, id: e.pointerId, t: performance.now() };
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
        /* 캡처가 안 돼도 끌기는 그대로 동작해요 */
      }
    }
    x.set(Math.max(-width, Math.min(0, d.start + dx)));
  };
  const onPointerUp = (e: React.PointerEvent, fromHandle: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) {
      if (fromHandle) settle(!open);
      return;
    }
    // 빠르게 튕기면 방향대로, 천천히 놓으면 30%만 당겨도(밀어도) 그쪽으로
    const dx = e.clientX - d.x;
    const speed = dx / Math.max(1, performance.now() - d.t); // px/ms
    const wasOpen = d.start > -width / 2;
    if (speed > 0.4) settle(true);
    else if (speed < -0.4) settle(false);
    else settle(wasOpen ? x.get() > -width * 0.3 : x.get() > -width * 0.7);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="pd" style={{ "--pd-w": `${width}px` } as React.CSSProperties}>
      <motion.button
        type="button"
        aria-label="서랍 닫기"
        tabIndex={-1}
        className="pd-shade"
        style={{ opacity: shade, pointerEvents: open ? "auto" : "none" }}
        onClick={() => settle(false)}
      />
      <motion.aside
        ref={panelRef}
        id={id}
        className="pd-panel"
        role="dialog"
        aria-modal={open}
        aria-label={label}
        aria-hidden={!open}
        tabIndex={-1}
        style={{ x }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => onPointerUp(e, false)}
        onPointerCancel={() => (drag.current = null)}
        inert={!open}
      >
        <div className="pd-inner">
          <p className="pd-title">{label}</p>
          {children}
        </div>
      </motion.aside>
      {/* 손잡이는 서랍 오른쪽 모서리에 붙어서 함께 움직여요 */}
      <motion.button
        type="button"
        className="pd-handle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? `${label} 닫기` : `${label} 열기 (오른쪽으로 당겨도 열려요)`}
        style={{ x }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => onPointerUp(e, true)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            settle(!open);
          }
        }}
      >
        {handle}
      </motion.button>
    </div>,
    document.body,
  );
}

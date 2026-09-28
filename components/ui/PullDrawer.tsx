"use client";
// ─────────────────────────────────────────────────────────────
// 당겨서 여는 나무 서랍 (왼쪽)
// - 손잡이(예: 책 옆에 꽂힌 책갈피)는 쓰는 쪽이 원하는 자리에 두고, useDrawer 의 handleProps 만 붙이면 돼요.
//   손잡이를 누르거나 옆으로 잡아당기면 서랍이 따라 나와요.
// - 서랍은 왼쪽으로 밀거나, 바깥을 누르거나, Esc 로 닫아요.
// - 안에 무엇을 넣을지는 쓰는 쪽이 정해요 (children). 설정 메뉴의 바탕이에요.
// ─────────────────────────────────────────────────────────────

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SPRING = { type: "spring", damping: 32, stiffness: 340 } as const;

type Drag = { x: number; start: number; moved: boolean; id: number; t: number };

export type DrawerState = {
  id: string;
  open: boolean;
  width: number;
  x: MotionValue<number>; // 서랍 위치: -width(닫힘) ~ 0(열림)
  tug: MotionValue<number>; // 손잡이가 손가락을 따라 살짝 끌려 나오는 거리
  settle: (open: boolean) => void;
  handleProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerCancel: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    "aria-expanded": boolean;
    "aria-controls": string;
  };
};

export function useDrawer(): DrawerState {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(320);
  const x = useMotionValue(-320);
  const tug = useMotionValue(0);
  const drag = useRef<Drag | null>(null);
  const id = useId();

  // 서랍 너비는 화면에 맞춰요 (폰에서는 화면의 86%, 넓은 화면에서는 360px)
  useEffect(() => {
    const measure = () => {
      const w = Math.round(Math.min(360, window.innerWidth * 0.86));
      setWidth(w);
      x.set(-w);
      setOpen(false);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [x]);

  const settle = useCallback(
    (next: boolean) => {
      setOpen(next);
      animate(x, next ? 0 : -width, SPRING);
      animate(tug, 0, SPRING);
    },
    [width, x, tug],
  );

  // 손잡이: 눌러서 열고 닫기, 또는 옆으로 잡아당기면 당긴 만큼 서랍이 나와요
  const handleProps: DrawerState["handleProps"] = {
    onPointerDown: (e) => {
      if (e.button !== 0) return;
      drag.current = { x: e.clientX, start: x.get(), moved: false, id: e.pointerId, t: performance.now() };
    },
    onPointerMove: (e) => {
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
      const progress = Math.min(1, Math.abs(dx) / (width * 0.55));
      x.set(-width + width * progress);
      tug.set(Math.max(-26, Math.min(10, dx * 0.4)));
    },
    onPointerUp: (e) => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.id !== e.pointerId) return;
      if (!d.moved) return settle(!open);
      const speed = Math.abs(e.clientX - d.x) / Math.max(1, performance.now() - d.t);
      settle(speed > 0.4 || x.get() > -width * 0.7);
    },
    onPointerCancel: () => {
      drag.current = null;
      settle(open);
    },
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        settle(!open);
      }
    },
    "aria-expanded": open,
    "aria-controls": id,
  };

  return { id, open, width, x, tug, settle, handleProps };
}

type Props = {
  drawer: DrawerState;
  label: string; // 서랍 제목 (화면 읽기 프로그램용 + 맨 위 이름판)
  children: React.ReactNode;
};

export default function PullDrawer({ drawer, label, children }: Props) {
  const { id, open, width, x, settle } = drawer;
  const [mounted, setMounted] = useState(false);
  const shade = useTransform(x, [-width, 0], [0, 1]);
  // 완전히 닫혀 있을 때는 그림자까지 숨겨요 (화면 왼쪽 끝에 비치지 않게)
  const visibility = useTransform(x, (v) => (v <= -width + 0.5 ? "hidden" : "visible"));
  const drag = useRef<Drag | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => setMounted(true), []);

  // 열려 있는 동안: Esc로 닫기, 서랍 안으로 포커스
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && settle(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, settle]);

  // 서랍 자체도 좌우로 끌 수 있어요 (왼쪽으로 밀면 닫혀요)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, start: x.get(), moved: false, id: e.pointerId, t: performance.now() };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 8) return;
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
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.moved) return;
    const speed = (e.clientX - d.x) / Math.max(1, performance.now() - d.t);
    if (speed < -0.4) settle(false);
    else if (speed > 0.4) settle(true);
    else settle(x.get() > -width * 0.3);
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
        style={{ x, visibility }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
        inert={!open}
      >
        <div className="pd-inner">
          <p className="pd-title">
            <span>{label}</span>
          </p>
          {children}
        </div>
        {/* 서랍 앞판과 황동 손잡이: 잡고 왼쪽으로 밀면 닫혀요 */}
        <div className="pd-front" aria-hidden>
          <span className="pd-pull" />
        </div>
      </motion.aside>
    </div>,
    document.body,
  );
}

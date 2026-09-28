"use client";
// 시트: 모바일에서는 아래에서 올라오고(끌어내려 닫기), 데스크톱에서는 오른쪽에서 열립니다.

import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  label: string; // 화면 읽기 프로그램용 제목
  tint?: string; // 시트 바탕에 아주 옅게 섞을 색 (책 표지 색)
};

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export default function Sheet({ open, onClose, children, label, tint }: Props) {
  const desktop = useIsDesktop();
  const drag = useDragControls();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 열려 있는 동안 뒤쪽 화면 스크롤 막기 + Esc 로 닫기
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const background = tint
    ? `color-mix(in oklab, ${tint} 5%, var(--color-paper))`
    : "var(--color-paper)";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={label}>
          <motion.button
            aria-label="닫기"
            className="absolute inset-0 h-full w-full cursor-default bg-[#15110d]/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {desktop ? (
            <motion.div
              className="absolute inset-y-0 right-0 flex w-[min(500px,92vw)] flex-col shadow-[-30px_0_60px_-30px_rgba(30,20,10,0.35)]"
              style={{ background }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 34, stiffness: 320 }}
            >
              <div className="flex justify-end px-6 pt-5">
                <button onClick={onClose} className="press px-2 py-1 text-[13px] text-ink-3 hover:text-ink">
                  닫기
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-10 pt-2 pb-14">{children}</div>
            </motion.div>
          ) : (
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[90svh] flex-col rounded-t-[22px] shadow-[0_-20px_50px_-20px_rgba(30,20,10,0.4)]"
              style={{ background }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 34, stiffness: 340 }}
              drag="y"
              dragListener={false}
              dragControls={drag}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 600) onClose();
              }}
            >
              {/* 이 손잡이 영역을 끌어내리면 닫혀요 */}
              <div
                className="flex cursor-grab touch-none justify-center pt-3 pb-4 active:cursor-grabbing"
                onPointerDown={(e) => drag.start(e)}
              >
                <span className="h-[5px] w-10 rounded-full bg-ink/15" />
              </div>
              <div className="overflow-y-auto overscroll-contain px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
                {children}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

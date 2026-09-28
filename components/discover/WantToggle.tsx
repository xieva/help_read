"use client";
// "읽고 싶은 책에 담기" 버튼. 누르면 담았다는 표시로 바뀝니다. (지금은 저장되지 않아요)

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function WantToggle() {
  const { gate } = useAuth();
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      onClick={() => gate(() => setSaved((s) => !s))}
      aria-pressed={saved}
      className={`press relative inline-flex h-10 items-center gap-2 text-[14px] transition-colors ${
        saved ? "text-accent" : "text-ink-2 hover:text-ink"
      }`}
    >
      <span className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full border border-current">
        <AnimatePresence mode="wait" initial={false}>
          {saved ? (
            <motion.svg
              key="check"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M1.5 5.2 4 7.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          ) : (
            <motion.span
              key="plus"
              className="text-[13px] leading-none"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              +
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {saved ? "읽고 싶은 책에 담았어요" : "읽고 싶은 책에 담기"}
    </button>
  );
}

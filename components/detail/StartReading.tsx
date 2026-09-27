"use client";
// 읽고 싶은 책의 "읽기 시작하기" (지금은 화면에서만 바뀌고 저장되지 않아요)

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export default function StartReading({ title }: { title: string }) {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-[54px]">
      <AnimatePresence mode="wait" initial={false}>
        {started ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-[18px] leading-relaxed"
          >
            좋아요. 오늘부터 ‘{title}’, 펼쳐 둔 책으로 옮겨둘게요.
            <span className="mt-1 block text-[13px] text-ink-3">예시 화면이라 실제로 저장되지는 않아요.</span>
          </motion.p>
        ) : (
          <motion.button
            key="start"
            exit={{ opacity: 0, y: -6 }}
            onClick={() => setStarted(true)}
            className="press inline-flex h-[54px] w-full items-center justify-center rounded-[14px] bg-ink px-8 text-[15.5px] font-medium text-paper hover:bg-[#2b251f] sm:w-auto"
          >
            읽기 시작하기
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

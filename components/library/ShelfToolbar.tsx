"use client";
// 서재 위의 한 줄짜리 도구 막대: 상태 탭 + 돋보기(누르면 검색창이 펼쳐져요)
// 책장이 화면에 한 번에 들어오도록 최대한 얇게 만들었어요.

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export type ToolbarTab = { key: string; label: string; count: number };

type Props = {
  tabs: ToolbarTab[];
  active: string;
  onTab: (key: string) => void;
  query: string;
  onQuery: (q: string) => void;
  extra?: React.ReactNode; // 검색창 옆에 붙는 것 (예: 분류 선택)
};

export default function ShelfToolbar({ tabs, active, onTab, query, onQuery, extra }: Props) {
  const [searching, setSearching] = useState(Boolean(query));

  return (
    <div className="relative mb-2 flex h-11 items-center gap-3">
      <AnimatePresence mode="wait" initial={false}>
        {searching ? (
          <motion.div
            key="search"
            className="flex min-w-0 flex-1 items-center gap-3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
          >
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 border-b border-rule focus-within:border-ink/50">
              <SearchIcon />
              <input
                autoFocus
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="제목이나 저자로 찾기"
                aria-label="서재에서 찾기"
                className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-4"
              />
            </label>
            {extra}
            <button
              type="button"
              className="press shrink-0 text-[13px] text-ink-3 hover:text-ink"
              onClick={() => {
                onQuery("");
                setSearching(false);
              }}
            >
              닫기
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="tabs"
            className="flex min-w-0 flex-1 items-center justify-between gap-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="no-scrollbar flex min-w-0 gap-5 overflow-x-auto" role="group" aria-label="독서 상태">
              {tabs.map((t) => {
                const on = active === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onTab(t.key)}
                    className={`press relative shrink-0 py-2.5 text-[14.5px] transition-colors ${on ? "text-ink" : "text-ink-3 hover:text-ink-2"}`}
                  >
                    {t.label}
                    <span className="numeral ml-1 align-super text-[10.5px] text-ink-4">{t.count}</span>
                    {on && (
                      <motion.span
                        layoutId="shelf-tab"
                        className="absolute inset-x-0 bottom-1 h-[1.5px] bg-ink"
                        transition={{ type: "spring", damping: 32, stiffness: 420 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="검색"
              onClick={() => setSearching(true)}
              className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:text-ink"
            >
              <SearchIcon />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

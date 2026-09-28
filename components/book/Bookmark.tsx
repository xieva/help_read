"use client";
// ─────────────────────────────────────────────────────────────
// 책갈피
// - 자연을 담은 여섯 가지 무늬 (밤하늘 · 잔디 · 바다 · 노을 · 벚꽃 · 눈)
// - 책마다 고른 무늬를 기억해요 (localStorage)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export type BookmarkId = "night" | "grass" | "sea" | "sunset" | "blossom" | "snow";

export const BOOKMARKS: { id: BookmarkId; name: string }[] = [
  { id: "night", name: "밤하늘" },
  { id: "grass", name: "잔디" },
  { id: "sea", name: "바다" },
  { id: "sunset", name: "노을" },
  { id: "blossom", name: "벚꽃" },
  { id: "snow", name: "눈" },
];

const KEY = "reader.bookmark-style.v1";

function readAll(): Record<string, BookmarkId> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

// 책 한 권의 책갈피 무늬 (없으면 밤하늘)
export function useBookmarkStyle(bookId: string): [BookmarkId, (id: BookmarkId) => void] {
  const [style, setStyle] = useState<BookmarkId>("night");
  useEffect(() => {
    const saved = readAll()[bookId];
    if (saved && BOOKMARKS.some((b) => b.id === saved)) setStyle(saved);
  }, [bookId]);
  const update = (id: BookmarkId) => {
    setStyle(id);
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [bookId]: id }));
    } catch {
      /* 저장이 안 돼도 이번에는 바뀐 모습으로 보여요 */
    }
  };
  return [style, update];
}

// 책갈피 그림 (카드 한 장). 크기는 부모가 정해요.
export function BookmarkArt({ id }: { id: BookmarkId }) {
  return (
    <span className={`bm bm-${id}`} aria-hidden>
      <svg viewBox="0 0 40 120" preserveAspectRatio="none" className="bm-svg">
        {id === "night" && (
          <>
            <path d="M27 14 a8 8 0 1 0 5 13 a6.5 6.5 0 1 1 -5 -13 Z" fill="#f4e7bd" />
            {[
              [8, 10, 1.1], [15, 30, 0.8], [30, 42, 1], [10, 52, 0.7], [22, 60, 1.2], [33, 74, 0.8],
              [7, 84, 1], [18, 92, 0.7], [29, 104, 1.1], [12, 112, 0.8], [36, 22, 0.7], [20, 76, 0.6],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={x} cy={y} r={r} fill="#fdf6de" opacity={0.55 + (i % 3) * 0.15} />
            ))}
          </>
        )}
        {id === "grass" && (
          <>
            <circle cx="30" cy="16" r="5" fill="#fff4c9" opacity="0.9" />
            <path d="M0 120 V86 C6 80 10 88 13 78 C16 88 20 76 24 84 C28 74 32 86 36 78 C38 84 40 82 40 84 V120 Z" fill="#6f9a52" />
            <path d="M0 120 V96 C5 90 8 98 12 90 C15 99 19 88 23 96 C27 88 31 98 35 90 C38 96 40 94 40 95 V120 Z" fill="#4f7b3d" />
            <circle cx="11" cy="84" r="1.6" fill="#f6f1e3" />
            <circle cx="29" cy="88" r="1.4" fill="#f3d36b" />
          </>
        )}
        {id === "sea" && (
          <>
            <circle cx="12" cy="20" r="5.5" fill="#fff7dc" opacity="0.85" />
            {[62, 74, 86, 98, 110].map((y, i) => (
              <path
                key={y}
                d={`M0 ${y} Q5 ${y - 3} 10 ${y} T20 ${y} T30 ${y} T40 ${y}`}
                stroke="#e8f4f6"
                strokeWidth="1"
                fill="none"
                opacity={0.35 + i * 0.1}
              />
            ))}
          </>
        )}
        {id === "sunset" && (
          <>
            <circle cx="20" cy="62" r="11" fill="#ffe0a3" opacity="0.95" />
            <path d="M0 120 V80 L9 70 L17 78 L26 66 L40 80 V120 Z" fill="#5b3a57" />
            <path d="M0 120 V92 L12 84 L24 94 L40 86 V120 Z" fill="#3e2a44" />
          </>
        )}
        {id === "blossom" && (
          <>
            <path d="M40 0 C30 12 32 22 20 30" stroke="#8a5a52" strokeWidth="1.4" fill="none" />
            {[
              [22, 30], [30, 18], [12, 50], [28, 68], [16, 88], [30, 104], [8, 112],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y}) rotate(${i * 40})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="0" cy="-2.6" rx="1.7" ry="2.6" fill="#fff4f5" opacity="0.9" transform={`rotate(${a})`} />
                ))}
                <circle r="0.9" fill="#e38da0" />
              </g>
            ))}
          </>
        )}
        {id === "snow" && (
          <>
            {[
              [8, 12], [26, 22], [14, 38], [32, 48], [6, 62], [22, 70], [34, 84], [12, 92],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1 + (i % 2) * 0.5} fill="#ffffff" opacity="0.85" />
            ))}
            <path d="M20 84 L28 100 H24 L31 112 H9 L16 100 H12 Z" fill="#46605a" />
            <path d="M0 120 V112 C12 108 26 114 40 110 V120 Z" fill="#f4f8fb" />
          </>
        )}
      </svg>
    </span>
  );
}

// 책갈피 고르기 (로그인 전에는 가입 안내)
export function BookmarkPicker({ value, onChange }: { value: BookmarkId; onChange: (id: BookmarkId) => void }) {
  const { gate } = useAuth();
  return (
    <div className="bm-picker" role="radiogroup" aria-label="책갈피 고르기">
      {BOOKMARKS.map((b) => (
        <button
          key={b.id}
          type="button"
          role="radio"
          aria-checked={value === b.id}
          onClick={() => gate(() => onChange(b.id))}
          className={`bm-option press ${value === b.id ? "is-on" : ""}`}
        >
          <span className="bm-thumb">
            <BookmarkArt id={b.id} />
          </span>
          <span className="bm-name">{b.name}</span>
        </button>
      ))}
    </div>
  );
}

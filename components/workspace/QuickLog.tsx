"use client";
// ─────────────────────────────────────────────────────────────
// 오늘 어디까지: 읽은 쪽을 한 번에 기록해요.
// 전자책을 불편해하는 이유 중 하나가 "지금 어디쯤인지 감이 안 온다(퍼센트만 보인다)"는 점이라,
// 리더는 늘 가지고 있는 판본의 쪽수로 기록하고, 남은 쪽수를 함께 보여줘요.
// - − / + 로 한 쪽씩, +10 · +20 · +30 으로 한 번에
// - 마지막 쪽까지 기록하면 "다 읽은 책"으로, 읽고 싶은 책을 기록하면 "읽는 중"으로 바뀌어요
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { makeBook, type PersonalBook } from "@/lib/user-library";
import { useWorkspace } from "./WorkspaceProvider";

type Props = {
  book: PersonalBook;
  onFinished?: (message: string) => void; // 끝까지 읽으면 이 칸이 사라지니, 안내는 바깥에서 보여줘요
  tone?: "paper" | "night"; // 독서 모드(어두운 화면)에서도 쓸 수 있게
  className?: string;
};

export default function QuickLog({ book, onFinished, tone = "paper", className = "" }: Props) {
  const { books, saveBooks } = useWorkspace();
  const [page, setPage] = useState(book.currentPage);
  const [saved, setSaved] = useState(book.currentPage);
  const [message, setMessage] = useState("");
  // 다른 곳(기록 수정 창)에서 쪽수가 바뀌면 따라가요
  if (book.currentPage !== saved) {
    setSaved(book.currentPage);
    setPage(book.currentPage);
  }
  const total = book.totalPages;
  const clamp = (n: number) => Math.max(0, Math.min(total, Math.round(Number.isFinite(n) ? n : 0)));
  const changed = page !== book.currentPage;
  const delta = page - book.currentPage;

  const save = () => {
    const next = clamp(page);
    const status = next >= total ? "finished" : next > 0 ? "reading" : book.status === "finished" ? "reading" : book.status;
    const updated = makeBook(
      { title: book.title, author: book.author, genre: book.genre, totalPages: total, currentPage: next, status, note: book.note },
      book,
    );
    if (!saveBooks(books.map((b) => (b.id === book.id ? updated : b)))) return;
    const text = status === "finished" ? "끝까지 읽었어요. 다 읽은 책에 꽂아 둘게요." : `${next}쪽까지 기록했어요.`;
    setMessage(text);
    if (status === "finished") onFinished?.(text);
  };

  return (
    <section className={`quicklog is-${tone} ${className}`} aria-label="오늘 읽은 쪽 기록">
      <div className="flex items-baseline justify-between gap-3">
        <p className="quicklog-title">오늘 어디까지 읽었나요?</p>
        <p className="quicklog-left">
          {page >= total ? "마지막 쪽이에요" : <>남은 <span className="numeral">{total - page}</span>쪽</>}
          {changed && delta > 0 && <span className="quicklog-delta"> · 오늘 +{delta}쪽</span>}
        </p>
      </div>
      <div className="quicklog-row">
        <button type="button" className="quicklog-step" aria-label="한 쪽 빼기" onClick={() => setPage((p) => clamp(p - 1))}>
          −
        </button>
        <label className="quicklog-page">
          <span className="sr-only">읽은 쪽</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={total}
            value={page}
            onChange={(e) => setPage(clamp(Number(e.target.value)))}
            onFocus={(e) => e.currentTarget.select()}
          />
          <span className="quicklog-total">/ {total}쪽</span>
        </label>
        <button type="button" className="quicklog-step" aria-label="한 쪽 더하기" onClick={() => setPage((p) => clamp(p + 1))}>
          +
        </button>
        <button type="button" className="quicklog-save press" disabled={!changed} onClick={save}>
          기록
        </button>
      </div>
      <div className="quicklog-chips" role="group" aria-label="한 번에 더하기">
        {[10, 20, 30].map((n) => (
          <button key={n} type="button" onClick={() => setPage((p) => clamp(p + n))}>
            +{n}쪽
          </button>
        ))}
        <button type="button" onClick={() => setPage(total)}>
          끝까지
        </button>
      </div>
      <p role="status" className="quicklog-msg">
        {message}
      </p>
    </section>
  );
}

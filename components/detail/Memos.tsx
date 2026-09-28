"use client";
// 나의 메모: 책의 여백에 적은 글처럼, 쪽수는 왼쪽 여백에 두고 생각은 오른쪽에 둡니다.
// 지금은 새로 적은 메모가 이 화면에서만 보이고 저장되지는 않아요. (나중에 DB 연결)

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export type MemoView = {
  id: string;
  page: number;
  quote?: string;
  note: string;
  dateLabel: string;
};

export default function Memos({ memos, currentPage }: { memos: MemoView[]; currentPage: number }) {
  const { gate } = useAuth();
  const [list, setList] = useState(memos);
  const [writing, setWriting] = useState(false);
  const [page, setPage] = useState(String(currentPage || ""));
  const [note, setNote] = useState("");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setList((l) => [
      { id: `new-${Date.now()}`, page: Number(page) || currentPage, note: note.trim(), dateLabel: "방금" },
      ...l,
    ]);
    setNote("");
    setWriting(false);
  };

  return (
    <div>
      <AnimatePresence initial={false} mode="wait">
        {writing ? (
          <motion.form
            key="form"
            onSubmit={save}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mb-10 grid grid-cols-[64px_1fr] gap-x-4"
          >
            <label className="pt-2 text-[12px] text-ink-3">
              쪽
              <input
                inputMode="numeric"
                value={page}
                onChange={(e) => setPage(e.target.value.replace(/\D/g, ""))}
                className="numeral mt-1 block w-full border-b border-rule bg-transparent pb-1 text-[18px] text-ink outline-none focus:border-ink/60"
              />
            </label>
            <div>
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="이 부분에서 떠오른 생각을 적어두세요"
                className="w-full resize-none border-b border-rule bg-transparent pt-2 font-serif text-[17px] leading-[1.7] outline-none placeholder:text-ink-4 focus:border-ink/60"
              />
              <div className="mt-3 flex justify-end gap-6 text-[14px]">
                <button type="button" onClick={() => setWriting(false)} className="press text-ink-3 hover:text-ink">
                  취소
                </button>
                <button type="submit" disabled={!note.trim()} className="press text-ink disabled:text-ink-4">
                  남기기
                </button>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.button
            key="open"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => gate(() => setWriting(true))}
            className="press mb-8 inline-flex h-11 items-center gap-2 text-[15px] text-ink-2 hover:text-ink"
          >
            <span className="text-[18px] leading-none text-accent">+</span>
            <span className="link-line">메모 남기기</span>
          </motion.button>
        )}
      </AnimatePresence>

      {list.length === 0 && !writing && (
        <p className="font-serif text-[16px] leading-[1.8] text-ink-3">
          아직 남긴 메모가 없어요. 마음에 남는 쪽을 만나면 적어두세요.
        </p>
      )}

      <ul className="space-y-9">
        <AnimatePresence initial={false}>
          {list.map((m) => (
            <motion.li
              key={m.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              className="grid grid-cols-[64px_1fr] gap-x-4"
            >
              <p className="pt-1 font-serif text-[15px] text-ink-3 italic">
                p.<span className="numeral not-italic">{m.page}</span>
              </p>
              <div>
                {m.quote && (
                  <p className="mb-3 font-serif text-[19px] leading-[1.6] text-ink">
                    <span className="bg-gradient-to-t from-accent/20 from-[35%] to-transparent to-[35%]">
                      {m.quote}
                    </span>
                  </p>
                )}
                <p className="text-[15px] leading-[1.8] text-ink-2">{m.note}</p>
                <p className="mt-2 text-[12px] text-ink-4">{m.dateLabel}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

"use client";
// AI 독서 도우미 (지금은 Mock 답변)
// AssistantProvider 로 감싸면, 화면 어디서든 AskButton / AssistantSuggestions 로 도우미를 열 수 있어요.

import { AnimatePresence, motion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Assistant } from "@/data/reading";
import { Arrow } from "@/components/ui/Buttons";
import Sheet from "@/components/ui/Sheet";
import { useAuth } from "@/components/auth/AuthProvider";

type Message = { id: number; question: string; answer: string[] | null };

type Ctx = { ask: (index?: number) => void; assistant: Assistant };
const AssistantContext = createContext<Ctx | null>(null);

function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("AssistantProvider 안에서 사용해 주세요.");
  return ctx;
}

type ProviderProps = {
  assistant: Assistant;
  bookTitle: string;
  tint: string;
  children: React.ReactNode;
};

export function AssistantProvider({ assistant, bookTitle, tint, children }: ProviderProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // 질문을 보내고, 잠시 생각하는 시간 뒤에 답을 보여줍니다
  const send = (question: string, answer: string[]) => {
    const id = nextId.current++;
    setMessages((m) => [...m, { id, question, answer: null }]);
    window.setTimeout(() => {
      setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, answer } : msg)));
    }, 1100);
  };

  const { gate } = useAuth();
  const ask = (index?: number) => {
    if (!gate()) return;
    setOpen(true);
    if (index === undefined) return;
    const qa = assistant.suggestions[index];
    if (qa && !messages.some((m) => m.question === qa.question)) send(qa.question, qa.answer);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    send(q, [
      `좋은 질문이에요. 지금은 예시 답변만 준비되어 있어요.`,
      `실제 AI가 연결되면, ${bookTitle}에서 읽은 부분과 남긴 메모를 바탕으로 이 질문에 답해 드릴게요.`,
    ]);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const remaining = assistant.suggestions
    .map((s, i) => ({ ...s, i }))
    .filter((s) => !messages.some((m) => m.question === s.question));

  return (
    <AssistantContext.Provider value={{ ask, assistant }}>
      {children}
      <Sheet open={open} onClose={() => setOpen(false)} label="독서 도우미" tint={tint}>
        <p className="eyebrow">독서 도우미 · {bookTitle}</p>
        <p className="mt-4 font-serif text-[24px] leading-snug">무엇이든 물어보세요.</p>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-3">{assistant.scopeNote}</p>

        <div className="mt-10 space-y-10">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <p className="font-serif text-[19px] leading-snug">{m.question}</p>
                {m.answer ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mt-4 space-y-3 border-l border-accent/40 pl-4"
                  >
                    {m.answer.map((p, i) => (
                      <p key={i} className="text-[15px] leading-[1.8] text-ink-2">
                        {p}
                      </p>
                    ))}
                  </motion.div>
                ) : (
                  <Thinking />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {remaining.length > 0 && (
          <div className="mt-10">
            <p className="eyebrow">{messages.length ? "이어서 물어보기" : "이런 걸 물어볼 수 있어요"}</p>
            <ul className="mt-2">
              {remaining.map((s) => (
                <li key={s.question} className="border-b border-rule/70 last:border-none">
                  <button
                    onClick={() => send(s.question, s.answer)}
                    className="press group flex w-full items-center justify-between gap-4 py-4 text-left text-[15px] text-ink-2 hover:text-ink"
                  >
                    {s.question}
                    <Arrow className="shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={submit} className="mt-8 flex items-center gap-3 border-b border-ink/25 focus-within:border-ink/60">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`${bookTitle}에 대해 묻기`}
            className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-4"
          />
          <button type="submit" className="press text-[14px] text-ink disabled:text-ink-4" disabled={!draft.trim()}>
            묻기
          </button>
        </form>
        <div ref={endRef} />
      </Sheet>
    </AssistantContext.Provider>
  );
}

function Thinking() {
  return (
    <div className="mt-4 flex items-center gap-2 pl-4 text-[13.5px] text-ink-3">
      생각을 정리하고 있어요
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1 w-1 rounded-full bg-ink-3"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </span>
    </div>
  );
}

// 도우미를 여는 버튼 (index 를 주면 그 질문을 바로 물어봐요)
export function AskButton({ children, index, className = "" }: { children: React.ReactNode; index?: number; className?: string }) {
  const { ask } = useAssistant();
  return (
    <button
      type="button"
      onClick={() => ask(index)}
      className={`press group inline-flex h-11 shrink-0 items-center whitespace-nowrap text-[15px] text-ink-2 hover:text-ink ${className}`}
    >
      <span className="link-line">{children}</span>
    </button>
  );
}

// 상세 화면 안에 보이는 질문 목록
export function AssistantSuggestions() {
  const { ask, assistant } = useAssistant();
  return (
    <ul>
      {assistant.suggestions.map((s, i) => (
        <li key={s.question} className="border-b border-rule/80 first:border-t">
          <button
            onClick={() => ask(i)}
            className="press group flex w-full items-center justify-between gap-6 py-5 text-left"
          >
            <span className="font-serif text-[17px] leading-snug md:text-[18px]">{s.question}</span>
            <Arrow className="shrink-0 text-ink-4 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
          </button>
        </li>
      ))}
    </ul>
  );
}

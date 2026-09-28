"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";

/** A small, daylight-lit bookcase. Theme values live in CSS for future weather settings. */
export default function ReadingShelf({ books, showReason = false, onOpen }: { books: Book[]; showReason?: boolean; onOpen?: (book: Book) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [entering, setEntering] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSelected(null);
    setEntering(null);
  }, [pathname]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setSelected(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const activeBook = books.find((book) => book.id === selected);
  if (!books.length) return <p className="text-sm text-ink-3">이 선반에 놓인 책이 아직 없어요.</p>;

  return (
    <div className="reading-shelf" ref={root} onKeyDown={(event) => {
      if (event.key === "Escape") {
        if (timer.current) clearTimeout(timer.current);
        setEntering(null);
        setSelected(null);
      }
    }}>
      <div className="shelf-window" aria-hidden="true" />
      <div className="shelf-scroll" role="group" aria-label="책장 · 책을 선택해 꺼내 보세요">
        <div className="shelf-row">
          {books.map((book) => {
            const active = selected === book.id;
            const height = Math.round(170 * Math.min(1.08, Math.max(.9, book.cover.size ?? 1)));
            const thickness = Math.round(Math.max(30, Math.min(44, book.totalPages / 12)));
            return (
              <Link key={book.id} href={onOpen ? `/library?book=${encodeURIComponent(book.id)}` : `/books/${book.id}`}
                className={`shelf-slot ${active ? "is-selected" : ""} ${entering === book.id ? "is-entering" : ""}`}
                style={{ "--book-h": `${height}px`, "--book-w": `${Math.round(height / 1.38)}px`, "--book-t": `${thickness}px`, "--book-bg": book.cover.bg, "--book-ink": book.cover.ink, "--lean": "0deg" } as CSSProperties}
                aria-label={`${book.title}, ${book.author} · ${active ? "다시 눌러 책으로 들어가기" : "책 꺼내 보기"}`}
                onPointerEnter={(event) => { if (event.pointerType === "mouse" && !entering) setSelected(book.id); }}
                onBlur={(event) => { if (!root.current?.contains(event.relatedTarget)) setSelected(null); }}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  if (entering) return;
                  if (!active) { setSelected(book.id); return; }
                  const href = `/books/${book.id}`;
                  const open = () => { setEntering(null); onOpen ? onOpen(book) : router.push(href); };
                  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { open(); return; }
                  setEntering(book.id);
                  timer.current = setTimeout(open, 380);
                }}>
                <span className="shelf-object" aria-hidden="true">
                  <span className="shelf-back" />
                  <span className="shelf-spine"><span className="shelf-spine-rule" /><span className="shelf-spine-title" style={{ fontSize: `${spineFont(book.title)}px` }}>{spineTitle(book.title)}</span><span className="shelf-spine-author">{book.author.split(",")[0]}</span></span>
                  <span className="shelf-pages" />
                  <span className="shelf-front"><BookCover book={book} className="h-full w-full" /></span>
                </span>
              </Link>
            );
          })}
          <span className="shelf-bookend" aria-hidden="true" />
          <div className="shelf-ghosts" aria-hidden="true">
            {Array.from({ length: 5 }, (_, group) => (
              <span className="ghost-group" key={group}>
                {Array.from({ length: 5 }, (_, i) => (
                  <span className="ghost-book" key={i} style={{
                    "--ghost-h": `${[136, 157, 145, 169, 151][(i + group) % 5]}px`,
                    "--ghost-w": `${[29, 37, 24, 32, 27][(i + group) % 5]}px`,
                    "--ghost-lean": "0deg",
                    "--ghost-alpha": [.3, .22, .36, .25, .32][(i + group) % 5],
                  } as CSSProperties}><span /></span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="shelf-caption" aria-live="polite" aria-atomic="true">
        {activeBook ? <><span className="shelf-caption-title">{activeBook.title}</span><span>{activeBook.author} <span aria-hidden="true">·</span> 다시 눌러 열기</span>{showReason && activeBook.addedReason && <p>{activeBook.addedReason}</p>}</> : <><span className="shelf-caption-title">내 책장</span><span>책을 선택해 확인하세요</span></>}
      </div>
    </div>
  );
}

// 책등 제목이 잘리지 않도록, 글자 수에 맞춰 크기를 줄여요 (너무 길면 끝을 …로)
function spineFont(title: string) {
  return Math.min(12, Math.max(8, 104 / Array.from(title).length));
}
function spineTitle(title: string) {
  const chars = Array.from(title);
  return chars.length > 13 ? chars.slice(0, 12).join("") + "…" : title;
}

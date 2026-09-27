"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";

/** A small, daylight-lit bookcase. Theme values live in CSS for future weather settings. */
export default function ReadingShelf({ books, showReason = false }: { books: Book[]; showReason?: boolean }) {
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
          {books.map((book, index) => {
            const active = selected === book.id;
            const display = index % 5 === 2;
            const height = Math.round(170 * Math.min(1.08, Math.max(.9, book.cover.size ?? 1)));
            const thickness = Math.round(Math.max(30, Math.min(44, book.totalPages / 12)));
            return (
              <Link key={book.id} href={`/books/${book.id}`}
                className={`shelf-slot ${display ? "is-displayed" : ""} ${active ? "is-selected" : ""} ${entering === book.id ? "is-entering" : ""}`}
                style={{ "--book-h": `${height}px`, "--book-w": `${Math.round(height / 1.38)}px`, "--book-t": `${thickness}px`, "--book-bg": book.cover.bg, "--book-ink": book.cover.ink, "--lean": `${[0, -3, -7, 2, 0][index % 5]}deg` } as CSSProperties}
                aria-label={`${book.title}, ${book.author} · ${active ? "다시 눌러 책으로 들어가기" : "책 꺼내 보기"}`}
                onPointerEnter={(event) => { if (event.pointerType === "mouse" && !entering) setSelected(book.id); }}
                onBlur={(event) => { if (!root.current?.contains(event.relatedTarget)) setSelected(null); }}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  if (entering) return;
                  if (!active) { setSelected(book.id); return; }
                  const href = `/books/${book.id}`;
                  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { router.push(href); return; }
                  setEntering(book.id);
                  timer.current = setTimeout(() => router.push(href), 380);
                }}>
                <span className="shelf-object" aria-hidden="true">
                  <span className="shelf-back" />
                  <span className="shelf-spine"><span className="shelf-spine-rule" /><span className="shelf-spine-title">{book.title}</span><span className="shelf-spine-author">{book.author.split(",")[0]}</span></span>
                  <span className="shelf-pages" />
                  <span className="shelf-front"><BookCover book={book} className="h-full w-full" /></span>
                </span>
              </Link>
            );
          })}
          <span className="shelf-bookend" aria-hidden="true" />
          <div className="shelf-ghosts" aria-hidden="true">
            {Array.from({ length: 5 }, (_, group) => (
              <span className={`ghost-group ${group % 2 ? "ghost-stack" : ""}`} key={group}>
                {Array.from({ length: group % 2 ? 4 : 5 }, (_, i) => (
                  <span className="ghost-book" key={i} style={{
                    "--ghost-h": `${[136, 157, 145, 169, 151][(i + group) % 5]}px`,
                    "--ghost-w": `${[29, 37, 24, 32, 27][(i + group) % 5]}px`,
                    "--ghost-lean": `${[0, -3, 0, 2, -2][i % 5]}deg`,
                    "--ghost-alpha": [.3, .22, .36, .25, .32][(i + group) % 5],
                  } as CSSProperties}><span /></span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="shelf-caption" aria-live="polite" aria-atomic="true">
        {activeBook ? <><span className="shelf-caption-title">{activeBook.title}</span><span>{activeBook.author} <span aria-hidden="true">·</span> 다시 누르면 펼쳐져요</span>{showReason && activeBook.addedReason && <p>{activeBook.addedReason}</p>}</> : <><span className="shelf-caption-title">잠시 머물러, 한 권.</span><span>마음이 가는 책을 꺼내 보세요</span></>}
      </div>
    </div>
  );
}

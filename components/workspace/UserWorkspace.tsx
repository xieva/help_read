"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BookStatus } from "@/data/books";
import { BRAND } from "@/lib/brand";
import { makeBook, validateInput, type BookInput, type PersonalBook } from "@/lib/user-library";
import ReadingShelf from "@/components/book/ReadingShelf";
import DateLine from "@/components/home/DateLine";
import { useWorkspace } from "./WorkspaceProvider";

const statuses: Record<BookStatus, string> = { reading: "읽는 중", want: "읽고 싶은", finished: "다 읽은" };
const PAGE_SIZE = 8;
export default function UserWorkspace({ section }: { section: string }) {
  const { books, error, saveBooks } = useWorkspace();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [genre, setGenre] = useState("all");
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const params = useSearchParams();
  const router = useRouter();
  const bookId = params.get("book");
  const selected = books.find((b) => b.id === bookId);
  const home = section === "/";
  const discover = section === "/discover";
  const search = query.trim().toLocaleLowerCase();
  const filtered = books.filter((b) => (filter === "all" || b.status === filter) && (genre === "all" || b.genre === genre) && `${b.title} ${b.author}`.toLocaleLowerCase().includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  const current = books.find((b) => b.status === "reading");
  const openBook = (id: string) => router.push(`/library?book=${encodeURIComponent(id)}`, { scroll: false });
  const close = () => { setAdding(false); if (bookId) router.replace(section, { scroll: false }); };
  const save = (input: BookInput, previous?: PersonalBook) => {
    const book = makeBook(input, previous);
    const next = previous ? books.map((b) => b.id === previous.id ? book : b) : [book, ...books];
    if (!saveBooks(next)) return false;
    setNotice(previous ? "기록을 저장했어요." : "서재에 추가했어요."); close(); return true;
  };
  const remove = (id: string) => { if (saveBooks(books.filter((b) => b.id !== id))) { setNotice("서재에서 삭제했어요."); close(); } };

  return <div className="wrap py-6 md:py-10">
    <header className="flex items-center justify-between"><Link href="/" className="font-medium tracking-tight">{BRAND.name}</Link><div className="flex items-center gap-5"><DateLine /><Link href="/creator" className="text-xs text-ink-2 underline-offset-4 hover:underline">제작자</Link></div></header>
    <div className="mt-10 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow">{home ? "MY READING" : discover ? "NEXT READ" : "MY LIBRARY"}</p><h1 className="mt-2 text-[32px] font-medium tracking-tight md:text-[42px]">{home ? "오늘의 책" : discover ? "다음 책" : "내 서재"}</h1></div><button className="reader-button" onClick={() => setAdding(true)}>+ 책 추가</button></div>
    <p role="status" className="mt-4 min-h-5 text-sm text-ink-2">{notice}</p>
    {error && <p role="alert" className="reader-error">{error}</p>}
    {bookId && !selected && <p role="alert" className="reader-error">이 브라우저의 서재에 없는 책이에요. <button onClick={close} className="underline">닫기</button></p>}
    {discover ? <section className="reader-empty"><h2>다음에 읽을 책을 모아두세요.</h2><p>책을 추가할 때 상태를 ‘읽고 싶은’으로 선택하면 됩니다.</p><p className="text-sm">자동 추천은 준비 중이에요.</p><Link href="/library" className="reader-button mt-5">서재 보기</Link></section> : books.length === 0 ? <section className="reader-empty"><div className="empty-volumes" aria-hidden="true"><i /><i /><i /></div><h2>첫 책을 놓아보세요.</h2><p>읽는 책도, 읽고 싶은 책도.</p><button className="reader-button mt-6" onClick={() => setAdding(true)}>첫 책 추가</button></section> : <>
      {home && current && <section className="reader-current"><div><p className="eyebrow">이어서 기록</p><h2 className="mt-2 text-2xl">{current.title}</h2><p className="mt-2 text-sm text-ink-2">{current.author} · {current.currentPage} / {current.totalPages}쪽</p></div><button className="reader-button secondary" onClick={() => openBook(current.id)}>독서 기록</button></section>}
      <section className="mt-6" aria-label="내 책 목록"><div className="reader-filters"><label><span className="sr-only">내 책 검색</span><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(0); }} placeholder="제목, 저자 검색" /></label><label><span className="sr-only">분류</span><select value={genre} onChange={(e) => { setGenre(e.target.value); setPage(0); }}><option value="all">모든 분류</option>{[...new Set(books.map((b) => b.genre))].map((g) => <option key={g}>{g}</option>)}</select></label></div>
        <div className="reader-tabs" role="group" aria-label="독서 상태 필터"><button aria-pressed={filter === "all"} onClick={() => { setFilter("all"); setPage(0); }}>전체 <span>{books.length}</span></button>{(Object.keys(statuses) as BookStatus[]).map((key) => <button key={key} aria-pressed={filter === key} onClick={() => { setFilter(key); setPage(0); }}>{statuses[key]} <span>{books.filter((b) => b.status === key).length}</span></button>)}</div>
        {visible.length ? <ReadingShelf key={`${filter}-${genre}-${safePage}-${query}`} books={visible} onOpen={(book) => openBook(book.id)} /> : <div className="py-14 text-center text-sm text-ink-2">{query ? "검색 결과가 없어요." : "이 분류에 책이 없어요."}</div>}
        <div className="shelf-pagination"><span>{filtered.length}권</span><div><button aria-label="이전 책장" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>←</button><span aria-live="polite">{safePage + 1} / {totalPages}</span><button aria-label="다음 책장" disabled={safePage + 1 >= totalPages} onClick={() => setPage(safePage + 1)}>→</button></div></div>
      </section>
    </>}
    <footer className="mt-12 border-t border-rule pt-5 text-xs leading-relaxed text-ink-3">책과 기록은 이 브라우저에 저장돼요. 다른 기기와는 아직 동기화되지 않아요.</footer>
    {(adding || selected) && <BookEditor key={selected?.id ?? "new"} book={selected} defaultStatus={discover ? "want" : "reading"} onClose={close} onSave={save} onDelete={remove} storageError={error} />}
  </div>;
}

function BookEditor({ book, defaultStatus, onClose, onSave, onDelete, storageError }: { book?: PersonalBook; defaultStatus: BookStatus; onClose: () => void; onSave: (input: BookInput, previous?: PersonalBook) => boolean; onDelete: (id: string) => void; storageError: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<BookStatus>(book?.status ?? defaultStatus);
  const [validation, setValidation] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { const d = ref.current; const oldOverflow = document.documentElement.style.overflow; d?.showModal(); document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = oldOverflow; d?.close(); }; }, []);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget); const totalPages = Number(f.get("totalPages"));
    const input: BookInput = { title: String(f.get("title")), author: String(f.get("author")), genre: String(f.get("genre")), totalPages, currentPage: status === "finished" ? totalPages : status === "want" ? 0 : Number(f.get("currentPage")), status, note: String(f.get("note")) };
    const message = validateInput(input); if (message) { setValidation(message); return; } setValidation(""); onSave(input, book);
  };
  return <dialog ref={ref} className="reader-dialog" aria-labelledby="book-editor-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) { const r=ref.current.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className="flex items-center justify-between gap-6"><h2 id="book-editor-title" className="text-2xl font-medium">{book ? "책과 기록" : "책 추가"}</h2><button type="button" onClick={onClose} className="reader-close" aria-label="닫기">✕</button></div>
    <form onSubmit={submit} className="reader-form mt-7"><label>제목<input autoFocus name="title" required maxLength={120} defaultValue={book?.title} placeholder="책 제목" /></label><label>저자<input name="author" required maxLength={100} defaultValue={book?.author} placeholder="저자 이름" /></label><label>분류<input name="genre" maxLength={40} defaultValue={book?.genre} placeholder="예: 소설, 인문, 경제" /></label><label>독서 상태<select aria-label="독서 상태" name="status" value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>{(Object.keys(statuses) as BookStatus[]).map((s) => <option key={s} value={s}>{statuses[s]}</option>)}</select></label><div className="grid grid-cols-2 gap-4"><label>전체 쪽수<input name="totalPages" type="number" inputMode="numeric" required min="1" max="100000" step="1" defaultValue={book?.totalPages} /></label><label>읽은 쪽수<input aria-label="읽은 쪽수" name="currentPage" type="number" inputMode="numeric" min="0" step="1" disabled={status !== "reading"} defaultValue={book?.currentPage ?? 0} /><span className="text-xs text-ink-3">{status === "finished" ? "전체 쪽수로 저장" : status === "want" ? "0쪽으로 저장" : ""}</span></label></div><label>메모<textarea aria-label="메모" name="note" rows={4} maxLength={10000} defaultValue={book?.note} placeholder="남기고 싶은 문장이나 생각" /></label>
      {(validation || storageError) && <p className="reader-error" role="alert">{validation || storageError}</p>}<button className="reader-button w-full" type="submit">{book ? "저장" : "서재에 추가"}</button>
    </form>
    {book && <div className="mt-5 border-t border-rule pt-5">{confirmDelete ? <div><p className="mb-3 text-sm">이 책과 메모를 서재에서 삭제할까요?</p><div className="flex gap-5"><button className="text-sm text-red-800 underline" onClick={() => onDelete(book.id)}>삭제하기</button><button className="text-sm" onClick={() => setConfirmDelete(false)}>취소</button></div></div> : <button className="text-sm text-ink-3 underline" onClick={() => setConfirmDelete(true)}>서재에서 삭제</button>}</div>}
  </dialog>;
}

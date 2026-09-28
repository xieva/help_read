"use client";
// 로그인한 사람의 화면: 오늘 / 서재 / 발견 / 책 상세(/book?id=...)
// 책은 이 브라우저에 계정별로 저장돼요 (WorkspaceProvider)

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { BookStatus } from "@/data/books";
import { BRAND } from "@/lib/brand";
import BrandMark from "@/components/brand/BrandMark";
import { makeBook, validateInput, type BookInput, type PersonalBook } from "@/lib/user-library";
import { useAuth } from "@/components/auth/AuthProvider";
import BookCover from "@/components/book/BookCover";
import BookStage from "@/components/book/BookStage";
import BookstoreShelf, { type ShelfBook } from "@/components/book/BookstoreShelf";
import CatalogDetails from "@/components/catalog/CatalogDetails";
import DiscoverCatalog from "@/components/catalog/DiscoverCatalog";
import ReadingTimer from "@/components/detail/ReadingTimer";
import { getCatalogBook, searchCatalog, type CatalogBook } from "@/lib/catalog";
import DateLine from "@/components/home/DateLine";
import ShelfToolbar from "@/components/library/ShelfToolbar";
import { useWorkspace } from "./WorkspaceProvider";

const statuses: Record<BookStatus, string> = { reading: "읽는 중", want: "읽고 싶은", finished: "다 읽은" };

const toShelf = (b: PersonalBook): ShelfBook => ({ ...b, href: `/book?id=${encodeURIComponent(b.id)}`, readHref: `/book?id=${encodeURIComponent(b.id)}&read=1` });
const progress = (b: PersonalBook) => (b.totalPages ? Math.round((b.currentPage / b.totalPages) * 100) : 0);

export default function UserWorkspace({ section }: { section: string }) {
  const { user } = useAuth();
  const { books, error, saveBooks } = useWorkspace();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<BookStatus | "all">("all");
  const [genre, setGenre] = useState("all");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const params = useSearchParams();
  const router = useRouter();

  const home = section === "/";
  const discover = section === "/discover";
  const detail = section === "/book";
  // /library?book=<id> 는 예전처럼 바로 편집 창을 열어요
  const editId = params.get("book");
  const detailId = params.get("id");
  const catalogSeed = getCatalogBook(params.get("add") ?? "");
  const fromNew = params.get("new") === "1";
  const detailBook = detail ? books.find((b) => b.id === detailId) : undefined;
  const editBook = editing ? detailBook : books.find((b) => b.id === editId);

  const search = query.trim().toLocaleLowerCase();
  const filtered = books.filter(
    (b) =>
      (filter === "all" || b.status === filter) &&
      (genre === "all" || b.genre === genre) &&
      `${b.title} ${b.author}`.toLocaleLowerCase().includes(search),
  );
  const reading = books
    .filter((b) => b.status === "reading")
    .sort((a, b) => (b.lastReadAt ?? "").localeCompare(a.lastReadAt ?? ""));
  const current = reading[0];

  const close = () => {
    setAdding(false);
    setEditing(false);
    if (editId || catalogSeed || fromNew) router.replace(section, { scroll: false });
  };
  const save = (input: BookInput, previous?: PersonalBook) => {
    const book = makeBook(input, previous);
    const next = previous ? books.map((b) => (b.id === previous.id ? book : b)) : [book, ...books];
    if (!saveBooks(next)) return false;
    setNotice(previous ? "기록을 저장했어요." : "서재에 추가했어요.");
    close();
    return true;
  };
  const remove = (id: string) => {
    if (saveBooks(books.filter((b) => b.id !== id))) {
      setNotice("서재에서 삭제했어요.");
      close();
      if (detail) router.replace("/library");
    }
  };

  const header = (
    <header className="flex items-center justify-between md:hidden">
      <Link href="/" className="flex items-center gap-2 font-serif text-[18px] tracking-tight">
        <BrandMark size={22} />
        {BRAND.name}
      </Link>
      <DateLine />
    </header>
  );

  const editor = (adding || editBook || catalogSeed || fromNew) && (
    <BookEditor
      key={editBook?.id ?? catalogSeed?.id ?? "new"}
      book={editBook}
      seed={catalogSeed}
      defaultStatus={discover || catalogSeed ? "want" : "reading"}
      onClose={close}
      onSave={save}
      onDelete={remove}
      storageError={error}
    />
  );

  // ── 책 상세 ────────────────────────────────────────────────
  if (detail) {
    if (!detailBook) {
      return (
        <div className="wrap py-20 text-center">
          <p className="font-serif text-[22px]">이 서재에 없는 책이에요.</p>
          <Link href="/library" className="reader-button mt-6">
            서재로
          </Link>
        </div>
      );
    }
    const b = detailBook;
    if (params.get("read") === "1") return <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-night px-6 text-night-ink">
      <Link href={`/book?id=${encodeURIComponent(b.id)}`} className="absolute top-8 left-6 text-sm">← 책으로</Link>
      <p className="text-sm text-night-ink/60">{b.title}</p><h1 className="mt-6 font-serif text-4xl">{Math.min(b.totalPages, Math.max(1, b.currentPage))}쪽부터.</h1>
      <p className="my-8 text-sm text-night-ink/60">가지고 있는 책을 펼치고, 읽는 데 집중해 보세요.</p><ReadingTimer />
      <Link href={`/library?book=${encodeURIComponent(b.id)}`} className="mt-12 rounded border border-night-ink/30 px-6 py-3 text-sm">읽은 쪽 기록하기</Link>
    </div>;
    return (
      <div className="wrap pt-4 pb-16 md:pt-2">
        <div className="flex h-12 items-center justify-between">
          <Link href="/library" className="press text-[14px] text-ink-2">
            ← 서재
          </Link>
          <span className="eyebrow">{statuses[b.status]}</span>
        </div>
        <div className="md:grid md:grid-cols-12 md:items-center md:gap-12">
          <div className="relative flex flex-col items-center justify-center overflow-x-clip pt-10 pb-8 md:col-span-6 md:py-12">
            <div aria-hidden className="lamp pointer-events-none absolute top-[42%] left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2" />
            <BookStage book={b} className="[--w:164px] md:[--w:220px]" />
          </div>
          <div className="md:col-span-6">
            <p className="eyebrow">{b.genre}</p>
            <h1 className="mt-2 font-serif text-[34px] leading-tight font-medium md:text-[48px]">{b.title}</h1>
            <p className="mt-2 text-[15px] text-ink-2">{b.author}</p>
            <div className="mt-8 max-w-md">
              <div className="flex justify-between text-[13px] text-ink-3">
                <span>
                  <span className="numeral text-ink-2">{b.currentPage}</span> / <span className="numeral">{b.totalPages}</span>쪽
                </span>
                <span className="numeral">{progress(b)}%</span>
              </div>
              <div className="mt-2 h-[3px] bg-ink/10">
                <div className="h-full bg-accent" style={{ width: `${progress(b)}%` }} />
              </div>
            </div>
            {b.note && (
              <div className="mt-8 max-w-md">
                <p className="eyebrow">나의 메모</p>
                <p className="mt-2 font-serif text-[16px] leading-[1.8] whitespace-pre-line text-ink-2">{b.note}</p>
              </div>
            )}
            <p role="status" className="mt-6 min-h-5 text-sm text-ink-2">{notice}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button className="reader-button press" onClick={() => setEditing(true)}>
                기록 수정
              </button>
              <Link href="/library" className="reader-button secondary press">
                서재로
              </Link>
            </div>
          </div>
        </div>
        <CatalogDetails book={b} />
        {editor}
      </div>
    );
  }

  if (discover) return <DiscoverCatalog />;

  const library = section === "/library";

  return (
    <div className="wrap py-5 md:py-8">
      {!library && header}
      {library ? (
        // 서재: 책장이 한 화면에 들어오도록 머리말을 한 줄로
        <div className="flex items-center justify-between gap-4 md:mt-2">
          <h1 className="font-serif text-[26px] leading-none font-medium tracking-[-0.02em] md:text-[40px]">
            {user ? `${user.name}님의 서재` : "내 서재"}
          </h1>
          <button className="reader-button is-small press" onClick={() => setAdding(true)}>
            + 책 추가
          </button>
        </div>
      ) : (
        <div className="mt-8 flex items-end justify-between gap-5 md:mt-2">
          <div>
            <p className="eyebrow">{user ? `${user.name}님의 ${home ? "오늘" : "다음 책"}` : ""}</p>
            <h1 className="mt-1 text-[32px] font-medium tracking-tight md:mt-2 md:text-[42px]">
              {home ? "오늘의 책" : "다음 책"}
            </h1>
          </div>
          <button className="reader-button press" onClick={() => setAdding(true)}>
            + 책 추가
          </button>
        </div>
      )}
      <p role="status" className={`text-sm text-ink-2 ${notice ? "mt-2 min-h-5" : ""}`}>
        {notice}
      </p>
      {error && (
        <p role="alert" className="reader-error">
          {error}
        </p>
      )}
      {editId && !editBook && (
        <p role="alert" className="reader-error">
          이 브라우저의 서재에 없는 책이에요.{" "}
          <button onClick={close} className="underline">
            닫기
          </button>
        </p>
      )}

      {books.length === 0 ? (
        <section className="reader-empty">
          <div className="empty-volumes" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <h2>첫 책을 놓아보세요.</h2>
          <p>읽는 책도, 읽고 싶은 책도.</p>
          <button className="reader-button mt-6" onClick={() => setAdding(true)}>
            첫 책 추가
          </button>
        </section>
      ) : home ? (
        <>
          {current && (
            <section className="mt-4 grid grid-cols-[112px_1fr] items-center gap-6 md:grid-cols-[150px_1fr] md:gap-10">
              <Link href={toShelf(current).href} className="press block" aria-label={`${current.title} 펼쳐보기`}>
                <BookCover book={current} className="book-pages w-full" />
              </Link>
              <div>
                <p className="eyebrow">지금 읽는 책</p>
                <h2 className="mt-1 font-serif text-[26px] leading-snug md:text-[34px]">{current.title}</h2>
                <p className="mt-1 text-[14px] text-ink-2">{current.author}</p>
                <p className="mt-3 text-[13px] text-ink-3">
                  <span className="numeral text-ink-2">{current.currentPage}</span> /{" "}
                  <span className="numeral">{current.totalPages}</span>쪽 · <span className="numeral">{progress(current)}</span>%
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={toShelf(current).href} className="reader-button press">
                    책 펼쳐보기
                  </Link>
                  <Link href={`/library?book=${encodeURIComponent(current.id)}`} className="reader-button secondary press">
                    기록하기
                  </Link>
                </div>
              </div>
            </section>
          )}
          <section className="mt-14">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[17px] font-medium">내 책장</h2>
              <Link href="/library" className="text-[13px] text-ink-2 underline underline-offset-4">
                전체 보기
              </Link>
            </div>
            <BookstoreShelf books={books.slice(0, 14).map(toShelf)} variant="strip" />
          </section>
        </>
      ) : (
        <section aria-label="내 책 목록" className="mt-2">
          <ShelfToolbar
            tabs={[
              { key: "all", label: "전체", count: books.length },
              ...(Object.keys(statuses) as BookStatus[]).map((key) => ({
                key,
                label: statuses[key],
                count: books.filter((b) => b.status === key).length,
              })),
            ]}
            active={filter}
            onTab={(key) => setFilter(key as BookStatus | "all")}
            query={query}
            onQuery={setQuery}
            extra={
              <select
                aria-label="분류"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="h-10 max-w-[96px] shrink-0 border-b border-rule bg-transparent text-[14px] outline-none"
              >
                <option value="all">모든 분류</option>
                {[...new Set(books.map((b) => b.genre))].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            }
          />
          {filtered.length ? (
            <BookstoreShelf books={filtered.map(toShelf)} onAdd={() => setAdding(true)} />
          ) : (
            <div className="py-14 text-center text-sm text-ink-2">{query ? "검색 결과가 없어요." : "이 분류에 책이 없어요."}</div>
          )}
        </section>
      )}
      <footer className="mt-12 border-t border-rule pt-5 text-xs leading-relaxed text-ink-3">
        책과 기록은 이 브라우저에 저장돼요. 다른 기기와는 아직 동기화되지 않아요.
      </footer>
      {editor}
    </div>
  );
}

function BookEditor({ book, seed, defaultStatus, onClose, onSave, onDelete, storageError }: { book?: PersonalBook; seed?: CatalogBook; defaultStatus: BookStatus; onClose: () => void; onSave: (input: BookInput, previous?: PersonalBook) => boolean; onDelete: (id: string) => void; storageError: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<BookStatus>(book?.status ?? defaultStatus);
  const [validation, setValidation] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [lookup, setLookup] = useState("");
  const [matchNotice, setMatchNotice] = useState(seed ? `${seed.title} · 소개와 아트 커버가 연결돼요.` : "");
  const choose = (entry: CatalogBook) => {
    const form = ref.current?.querySelector("form");
    if (!form) return;
    for (const name of ["title", "author", "genre"] as const) {
      const field = form.elements.namedItem(name) as HTMLInputElement;
      field.value = entry[name];
    }
    setLookup(""); setMatchNotice(`${entry.title} · 소개와 아트 커버가 연결돼요.`);
  };
  useEffect(() => { const d = ref.current; const oldOverflow = document.documentElement.style.overflow; d?.showModal(); document.documentElement.style.overflow = "hidden"; return () => { document.documentElement.style.overflow = oldOverflow; d?.close(); }; }, []);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const f = new FormData(e.currentTarget); const totalPages = Number(f.get("totalPages"));
    const input: BookInput = { title: String(f.get("title")), author: String(f.get("author")), genre: String(f.get("genre")), totalPages, currentPage: status === "finished" ? totalPages : status === "want" ? 0 : Number(f.get("currentPage")), status, note: String(f.get("note")) };
    const message = validateInput(input); if (message) { setValidation(message); return; } setValidation(""); onSave(input, book);
  };
  return <dialog ref={ref} className="reader-dialog" aria-labelledby="book-editor-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) { const r=ref.current.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) onClose(); } }}>
    <div className="flex items-center justify-between gap-6"><h2 id="book-editor-title" className="text-2xl font-medium">{book ? "책과 기록" : "책 추가"}</h2><button type="button" onClick={onClose} className="reader-close" aria-label="닫기">✕</button></div>
    {!book && <div className="catalog-match"><label className="text-sm">카탈로그에서 찾기<input aria-label="카탈로그에서 찾기" value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="제목 또는 저자" /></label>
      {lookup.trim() && (searchCatalog(lookup).length ? searchCatalog(lookup).slice(0, 5).map((b) => <button type="button" key={b.id} onClick={() => choose(b)}>{b.title}<span>{b.author}</span></button>) : <p className="mt-3 text-xs text-ink-3">아직 없는 책이에요. 아래에서 직접 입력할 수 있어요.</p>)}
      {matchNotice && <p className="mt-3 text-xs text-ink-2" role="status">{matchNotice}</p>}<p className="mt-2 text-xs text-ink-3">쪽수는 가지고 있는 판본에 맞춰 입력해 주세요.</p>
    </div>}
    <form onSubmit={submit} className="reader-form mt-7"><label>제목<input autoFocus name="title" required maxLength={120} defaultValue={book?.title ?? seed?.title} placeholder="책 제목" /></label><label>저자<input name="author" required maxLength={100} defaultValue={book?.author ?? seed?.author} placeholder="저자 이름" /></label><label>분류<input name="genre" maxLength={40} defaultValue={book?.genre ?? seed?.genre} placeholder="예: 소설, 인문, 경제" /></label><label>독서 상태<select aria-label="독서 상태" name="status" value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>{(Object.keys(statuses) as BookStatus[]).map((s) => <option key={s} value={s}>{statuses[s]}</option>)}</select></label><div className="grid grid-cols-2 gap-4"><label>전체 쪽수<input name="totalPages" type="number" inputMode="numeric" required min="1" max="100000" step="1" defaultValue={book?.totalPages} /></label><label>읽은 쪽수<input aria-label="읽은 쪽수" name="currentPage" type="number" inputMode="numeric" min="0" step="1" disabled={status !== "reading"} defaultValue={book?.currentPage ?? 0} /><span className="text-xs text-ink-3">{status === "finished" ? "전체 쪽수로 저장" : status === "want" ? "0쪽으로 저장" : ""}</span></label></div><label>메모<textarea aria-label="메모" name="note" rows={4} maxLength={10000} defaultValue={book?.note} placeholder="남기고 싶은 문장이나 생각" /></label>
      {(validation || storageError) && <p className="reader-error" role="alert">{validation || storageError}</p>}<button className="reader-button w-full" type="submit">{book ? "저장" : "서재에 추가"}</button>
    </form>
    {book && <div className="mt-5 border-t border-rule pt-5">{confirmDelete ? <div><p className="mb-3 text-sm">이 책과 메모를 서재에서 삭제할까요?</p><div className="flex gap-5"><button className="text-sm text-red-800 underline" onClick={() => onDelete(book.id)}>삭제하기</button><button className="text-sm" onClick={() => setConfirmDelete(false)}>취소</button></div></div> : <button className="text-sm text-ink-3 underline" onClick={() => setConfirmDelete(true)}>서재에서 삭제</button>}</div>}
  </dialog>;
}

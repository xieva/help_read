// 내 서재 화면
// 읽는 중인 책은 크게, 읽고 싶은 책과 다 읽은 책은 책장 위에 놓인 모습으로 보여줍니다.

import Link from "next/link";
import BookCover from "@/components/BookCover";
import ProgressLine from "@/components/ProgressLine";
import Shelf from "@/components/Shelf";
import { formatRelativeDay, getAllBooks, getBooksByStatus, getProgress } from "@/lib/library";

export default function LibraryPage() {
  const reading = getBooksByStatus("reading");
  const want = getBooksByStatus("want");
  const finished = getBooksByStatus("finished");

  return (
    <div>
      <header className="pt-8 md:pt-16">
        <h1 className="font-serif text-[28px] font-medium md:text-[34px]">서재</h1>
        <p className="mt-2 text-[14px] text-muted">
          책 {getAllBooks().length}권 · 지금 {reading.length}권을 읽고 있어요
        </p>
      </header>

      {/* 읽는 중 */}
      <section className="mt-12">
        <h2 className="text-[13px] text-muted">읽는 중</h2>
        <div className="mt-6 grid gap-10 md:grid-cols-2 md:gap-12">
          {reading.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} className="group flex items-end gap-6">
              <BookCover
                title={book.title}
                author={book.author}
                cover={book.cover}
                coverImage={book.coverImage}
                className="w-28 transition-transform duration-300 group-hover:-translate-y-1 md:w-32"
              />
              <div className="min-w-0 flex-1 pb-1">
                <p className="font-serif text-[20px] leading-snug group-hover:text-accent">{book.title}</p>
                <p className="mt-1 text-[14px] text-ink-soft">{book.author}</p>
                <ProgressLine value={getProgress(book)} className="mt-5" />
                <p className="mt-2 text-[13px] text-muted tabular-nums">
                  {book.currentPage} / {book.totalPages}쪽 · {formatRelativeDay(book.lastReadAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 읽고 싶은 책 */}
      <section className="mt-20">
        <h2 className="text-[13px] text-muted">읽고 싶은 책</h2>
        <Shelf books={want} />
      </section>

      {/* 다 읽은 책 */}
      <section className="mt-16">
        <h2 className="text-[13px] text-muted">다 읽은 책</h2>
        <Shelf books={finished} />
      </section>
    </div>
  );
}

// 책장 한 칸: 표지들이 하나의 선 위에 서 있는 모습
// 책마다 크기(cover.size)가 조금씩 달라서 실제 책장처럼 보입니다.

import Link from "next/link";
import type { Book } from "@/data/books";
import BookCover from "./BookCover";

export default function Shelf({ books }: { books: Book[] }) {
  return (
    <div className="-mx-6 md:mx-0">
      <div className="no-scrollbar flex items-end gap-5 overflow-x-auto px-6 pt-4 md:gap-7 md:px-0">
        {books.map((book) => (
          <Link
            key={book.id}
            href={`/books/${book.id}`}
            className="shrink-0 transition-transform duration-300 hover:-translate-y-1"
            style={{ width: `${Math.round(104 * (book.cover.size ?? 1))}px` }}
          >
            <BookCover title={book.title} author={book.author} cover={book.cover} coverImage={book.coverImage} />
          </Link>
        ))}
      </div>
      {/* 책이 놓인 선반 */}
      <div className="mx-6 h-px bg-ink/15 md:mx-0" />
      <div className="mx-6 h-3 bg-gradient-to-b from-ink/[0.05] to-transparent md:mx-0" />
    </div>
  );
}

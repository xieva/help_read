// 서재
// 데이터는 여기(서버)에서 준비하고, 검색·필터 같은 움직이는 부분은 LibraryView 가 맡습니다.

import { Suspense } from "react";
import LibraryView, { type LibraryItem } from "@/components/library/LibraryView";
import {
  formatDate,
  formatMonth,
  formatRelativeDay,
  getAllBooks,
  getBooksByStatus,
  getChapterAt,
  getProgress,
  getSegments,
} from "@/lib/library";

export default function LibraryPage() {
  const order = [...getBooksByStatus("reading"), ...getBooksByStatus("want"), ...getBooksByStatus("finished")];

  const items: LibraryItem[] = order.map((book) => {
    const chapter = getChapterAt(book, book.currentPage);
    return {
      book,
      progress: getProgress(book),
      segments: getSegments(book),
      chapterLabel: chapter ? `${chapter.no}장 ${chapter.title}` : undefined,
      year: book.finishedAt ? new Date(book.finishedAt).getFullYear() : undefined,
      meta:
        book.status === "reading"
          ? formatRelativeDay(book.lastReadAt)
          : book.status === "finished"
            ? formatMonth(book.finishedAt).replace(/^\d+년 /, "") + " 읽음"
            : `${formatDate(book.addedAt)} 담음`,
    };
  });

  const thisYear = new Date().getFullYear();
  const finishedThisYear = items.filter((i) => i.book.status === "finished" && i.year === thisYear).length;

  return (
    <div className="wrap pt-[max(24px,env(safe-area-inset-top))] md:pt-10">
      <header>
        <h1 className="font-serif text-[40px] leading-none font-medium tracking-[-0.02em] md:text-[64px]">서재</h1>
        <p className="mt-4 text-[14px] text-ink-3">
          <span className="numeral text-ink-2">{getAllBooks().length}</span>권의 책 · 올해{" "}
          <span className="numeral text-ink-2">{finishedThisYear}</span>권을 끝까지 읽었어요
        </p>
      </header>
      <Suspense>
        <LibraryView items={items} />
      </Suspense>
    </div>
  );
}

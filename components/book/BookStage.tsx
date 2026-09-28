"use client";
// 상세 화면의 책 자리: 만져볼 수 있는 책 + 책갈피 고르기
// 책갈피는 읽는 중인 책에만 꽂혀 있고, 무늬는 책마다 기억해요.

import BookViewer, { type ViewerBook } from "./BookViewer";
import { BookmarkPicker, useBookmarkStyle } from "./Bookmark";

type Props = {
  book: ViewerBook & { id: string };
  className?: string; // 책 크기: "[--w:164px] md:[--w:220px]"
};

export default function BookStage({ book, className = "" }: Props) {
  const [mark, setMark] = useBookmarkStyle(book.id);
  const reading = book.status === "reading" && book.currentPage > 0;
  return (
    <div className="flex flex-col items-center">
      <BookViewer book={book} bookmark={reading ? mark : undefined} morphId={book.id} className={className} />
      {reading && (
        <div className="mt-7">
          <p className="eyebrow mb-3 text-center">책갈피 고르기</p>
          <BookmarkPicker value={mark} onChange={setMark} />
        </div>
      )}
    </div>
  );
}

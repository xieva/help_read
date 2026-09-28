"use client";
// 상세 화면의 책 자리: 만져볼 수 있는 책 + 왼쪽 책 설정 서랍 (책갈피를 당기면 나와요)
// 책갈피는 읽는 중인 책에만 꽂혀 있고, 무늬는 책마다 기억해요.

import BookSettings from "./BookSettings";
import BookViewer, { type ViewerBook } from "./BookViewer";
import { useBookmarkStyle } from "./Bookmark";

type Props = {
  book: ViewerBook & { id: string };
  className?: string; // 책 크기: "[--w:164px] md:[--w:220px]"
  settings?: boolean; // 왼쪽 설정 서랍 (공용 작품 화면에서는 끔)
};

export default function BookStage({ book, className = "", settings = true }: Props) {
  const [mark, setMark] = useBookmarkStyle(book.id);
  const reading = book.status === "reading" && book.currentPage > 0;
  return (
    <div className="flex flex-col items-center">
      <BookViewer book={book} bookmark={reading ? mark : undefined} morphId={book.id} className={className} />
      {settings && <BookSettings mark={mark} onMark={setMark} reading={reading} />}
    </div>
  );
}

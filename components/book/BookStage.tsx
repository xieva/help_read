"use client";
// 상세 화면의 책 자리: 만져볼 수 있는 책 + 책 옆에 꽂힌 설정 책갈피 (당기면 나무 서랍이 나와요)
// 책갈피는 읽는 중인 책에만 꽂혀 있고, 무늬는 책마다 기억해요.

import { useDrawer } from "@/components/ui/PullDrawer";
import BookSettings, { BookmarkTab } from "./BookSettings";
import BookViewer, { type ViewerBook } from "./BookViewer";
import { useBookmarkStyle } from "./Bookmark";

type Props = {
  book: ViewerBook & { id: string };
  className?: string; // 책 크기: "[--w:164px] md:[--w:220px]"
  settings?: boolean; // 설정 책갈피와 서랍 (공용 작품 화면에서는 끔)
};

export default function BookStage({ book, className = "", settings = true }: Props) {
  const [mark, setMark] = useBookmarkStyle(book.id);
  const drawer = useDrawer();
  const reading = book.status === "reading" && book.currentPage > 0;
  return (
    <div className="flex flex-col items-center">
      <BookViewer
        book={book}
        bookmark={reading ? mark : undefined}
        morphId={book.id}
        className={className}
        tab={settings ? <BookmarkTab drawer={drawer} mark={mark} /> : undefined}
      />
      {settings && <BookSettings drawer={drawer} mark={mark} onMark={setMark} reading={reading} />}
    </div>
  );
}

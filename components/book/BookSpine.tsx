// 선반에 꽂힌 책의 책등
// 두께는 쪽수, 높이는 책 크기(cover.size)에 따라 조금씩 다릅니다.

import type { CoverBook } from "./BookCover";

type Props = {
  book: CoverBook & { totalPages: number };
  baseHeight?: number;
};

export default function BookSpine({ book, baseHeight = 176 }: Props) {
  const width = Math.round(Math.min(48, Math.max(26, book.totalPages / 13)));
  const height = Math.round(baseHeight * (book.cover.size ?? 1));
  const accent = book.cover.accent ?? book.cover.ink;

  return (
    <div
      className="spine flex flex-col items-center justify-between py-3"
      style={{ width, height, backgroundColor: book.cover.bg, color: book.cover.ink }}
    >
      <span className="flex w-full flex-col gap-[3px] px-[5px] opacity-70" aria-hidden>
        <span className="block h-px w-full" style={{ backgroundColor: accent }} />
        <span className="block h-px w-full" style={{ backgroundColor: accent }} />
      </span>
      <span
        className="font-serif text-[12.5px] leading-none font-medium whitespace-nowrap"
        style={{ writingMode: "vertical-rl" }}
      >
        {book.title}
      </span>
      <span className="text-[8px] opacity-60" style={{ writingMode: "vertical-rl" }}>
        {book.author.split(",")[0]}
      </span>
    </div>
  );
}

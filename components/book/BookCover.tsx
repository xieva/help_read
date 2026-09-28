// 책 표지 (평면)
// 실제 표지 이미지(coverImage)가 있으면 이미지를, 없으면 타이포그래피로 만든 표지를 보여줍니다.
// 표지 스타일은 5가지: classic / frame / band / type / minimal

import type { Cover } from "@/data/books";
import { matchCatalogBook } from "@/lib/catalog";
import CatalogCoverArt from "./CatalogCoverArt";

export type CoverBook = {
  title: string;
  author: string;
  cover: Cover;
  coverImage?: string;
};

type Props = {
  book: CoverBook;
  className?: string;
  style?: React.CSSProperties;
};

export default function BookCover({ book, className = "", style }: Props) {
  const { cover } = book;
  const catalog = matchCatalogBook(book);

  return (
    <div
      className={`cover @container aspect-[1/1.38] shrink-0 ${className}`}
      style={{ backgroundColor: cover.bg, color: cover.ink, ...style }}
    >
      {book.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={book.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : catalog ? <CatalogCoverArt book={catalog} /> : (
        <CoverArt book={book} />
      )}
    </div>
  );
}

function CoverArt({ book }: { book: CoverBook }) {
  const { cover, title, author } = book;
  const accent = cover.accent ?? cover.ink;

  switch (cover.style) {
    case "frame":
      return (
        <div className="absolute inset-0">
          <div className="absolute inset-[6.5%] border opacity-50" style={{ borderColor: accent }} />
          <div className="absolute inset-0 flex flex-col items-center px-[16%] pt-[26%] pb-[15%] text-center">
            <span className="block h-[3cqw] w-[3cqw] rotate-45 opacity-70" style={{ backgroundColor: accent }} />
            <p className="mt-[10%] font-serif text-[11.5cqw] leading-[1.28] font-medium">{title}</p>
            <p className="mt-auto text-[5.2cqw] tracking-[0.12em] opacity-75">{author}</p>
          </div>
        </div>
      );

    case "band":
      return (
        <div className="absolute inset-0">
          <div className="absolute inset-x-0 top-[60%] h-[13%]" style={{ backgroundColor: accent }} />
          <div className="absolute inset-x-0 top-0 flex h-[60%] flex-col justify-end px-[12%] pb-[7%] pl-[14%]">
            <p className="font-serif text-[13cqw] leading-[1.18] font-semibold">{title}</p>
          </div>
          <p className="absolute bottom-[9%] left-[14%] text-[5.4cqw] tracking-[0.08em] opacity-80">{author}</p>
        </div>
      );

    case "type":
      return (
        <div className="absolute inset-0 flex flex-col px-[11%] pt-[11%] pb-[10%] pl-[13%]">
          <div className="flex items-center justify-between">
            <p className="text-[5.2cqw] tracking-[0.1em] opacity-80">{author}</p>
            <span className="block h-[1.6cqw] w-[9cqw]" style={{ backgroundColor: accent }} />
          </div>
          <p className="mt-auto font-serif text-[18cqw] leading-[1.08] font-semibold tracking-[-0.02em]">{title}</p>
        </div>
      );

    case "minimal":
      return (
        <div className="absolute inset-0 flex flex-col items-center px-[14%] pt-[38%] pb-[12%] text-center">
          <p className="font-serif text-[10.5cqw] leading-[1.3] font-medium">{title}</p>
          <span className="mt-[8%] block h-[1.8cqw] w-[1.8cqw] rounded-full opacity-80" style={{ backgroundColor: accent }} />
          <p className="mt-auto text-[5cqw] tracking-[0.14em] opacity-70">{author}</p>
        </div>
      );

    case "classic":
    default:
      return (
        <div className="absolute inset-0 flex flex-col px-[12%] pt-[15%] pb-[11%] pl-[14%]">
          <p className="font-serif text-[12.5cqw] leading-[1.22] font-medium">{title}</p>
          <span className="mt-[8%] block h-px w-[20%] opacity-70" style={{ backgroundColor: accent }} />
          <p className="mt-auto text-[5.6cqw] tracking-[0.06em] opacity-80">{author}</p>
        </div>
      );
  }
}

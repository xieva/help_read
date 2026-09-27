// 책 표지 컴포넌트
// 실제 표지 이미지(coverImage)가 있으면 이미지를, 없으면 글자로 만든 표지를 보여줍니다.

import type { Book } from "@/data/books";

type Props = {
  title: string;
  author: string;
  cover: Book["cover"];
  coverImage?: string;
  className?: string; // 크기 조절용 (예: "w-40")
};

export default function BookCover({ title, author, cover, coverImage, className = "" }: Props) {
  return (
    <div
      className={`@container relative aspect-[2/3] shrink-0 overflow-hidden rounded-[2px_4px_4px_2px] shadow-book ${className}`}
      style={{ backgroundColor: cover.color, color: cover.ink }}
    >
      {coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt={title} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full flex-col justify-between px-[11%] pt-[16%] pb-[12%]">
          <div>
            <p className="font-serif text-[12.5cqw] leading-[1.25] font-medium">{title}</p>
            <div className="mt-[9%] h-px w-[18%] opacity-60" style={{ backgroundColor: cover.ink }} />
          </div>
          <p className="text-[6.5cqw] tracking-wide opacity-80">{author}</p>
        </div>
      )}

      {/* 책등 쪽의 자연스러운 접힘 그림자 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/25 via-black/5 to-white/10" />
      <div className="pointer-events-none absolute inset-y-0 left-[7%] w-px bg-white/10" />
    </div>
  );
}

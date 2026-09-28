// 입체 책 오브젝트
// 표지 + 책등 + 종이 면으로 만든 "실제 책". 쪽수가 많을수록 두껍습니다.
// 너비는 className 으로 CSS 변수 --w 를 지정합니다. 예: "[--w:200px] md:[--w:300px]"

import BookCover, { type CoverBook } from "./BookCover";

type Props = {
  book: CoverBook & { totalPages: number };
  className?: string;
  interactive?: boolean; // 손을 올리면 정면으로 돌아오는 움직임
  castShadow?: boolean; // 뒤로 길게 떨어지는 그림자
};

export default function Book3D({ book, className = "", interactive = true, castShadow = true }: Props) {
  const thickness = 0.035 + Math.min(book.totalPages, 900) / 9000;
  const spine = `color-mix(in oklab, ${book.cover.bg} 78%, black)`;

  return (
    <div
      className={`book3d ${interactive ? "book3d-interactive" : ""} ${className}`}
      style={
        {
          "--t": `calc(var(--w) * ${thickness.toFixed(3)})`,
          "--spine": spine,
        } as React.CSSProperties
      }
    >
      {castShadow && <div className="book3d-cast" aria-hidden />}
      <div className="book3d-shadow" aria-hidden />
      <div className="book3d-body">
        <div className="book3d-back" aria-hidden />
        <div className="book3d-spine" aria-hidden />
        <div className="book3d-edge" aria-hidden />
        <div className="book3d-front">
          <BookCover book={book} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}

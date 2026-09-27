// AI 책 추천 화면
// 최근 좋아한 책을 바탕으로, 이유와 함께 다음 책을 추천합니다. (지금은 Mock Data)

import Link from "next/link";
import BookCover from "@/components/BookCover";
import { getBook, getLikedBooks, getRecommendations } from "@/lib/library";

export default function DiscoverPage() {
  const liked = getLikedBooks();
  const recommendations = getRecommendations();

  return (
    <div>
      <header className="pt-8 md:pt-16">
        <h1 className="font-serif text-[28px] font-medium md:text-[34px]">다음에 읽을 책</h1>
      </header>

      {/* 추천의 바탕이 된 책들 */}
      <section className="mt-10">
        <p className="text-[13px] text-muted">최근 좋아한 책</p>
        <div className="mt-5 flex items-end gap-3">
          {liked.map((book) => (
            <Link key={book.id} href={`/books/${book.id}`} className="w-14">
              <BookCover title={book.title} author={book.author} cover={book.cover} coverImage={book.coverImage} />
            </Link>
          ))}
        </div>
        <p className="mt-6 max-w-lg font-serif text-[17px] leading-[1.85] text-ink-soft">
          {liked.map((book) => book.title).join(", ")}. 최근 즐겁게 읽은 이 책들을 바탕으로 다음에 펼쳐볼
          만한 책을 골라봤어요.
        </p>
      </section>

      {/* 추천 목록 */}
      <section className="mt-16 max-w-3xl">
        {recommendations.map((rec, index) => {
          const base = getBook(rec.basedOn);
          return (
            <div
              key={rec.id}
              className={`flex gap-6 py-10 md:gap-10 ${index > 0 ? "border-t border-line/80" : ""}`}
            >
              <BookCover title={rec.title} author={rec.author} cover={rec.cover} className="w-24 md:w-32" />
              <div className="min-w-0">
                <p className="font-serif text-[21px] leading-snug md:text-[24px]">{rec.title}</p>
                <p className="mt-1 text-[14px] text-ink-soft">{rec.author}</p>
                <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft md:text-[16px]">{rec.reason}</p>
                {base && (
                  <p className="mt-4 text-[13px] text-muted">
                    <span className="text-accent/80">—</span> {base.title}에서 이어지는 책
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <p className="mt-6 text-[12px] text-muted">
        지금은 예시 데이터로 보여주고 있어요. 앞으로는 읽은 책과 취향을 바탕으로 추천이 만들어질 거예요.
      </p>
    </div>
  );
}

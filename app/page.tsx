// 홈 화면 ("오늘")
// 앱을 켜면 가장 먼저 보이는 화면입니다. 읽던 책으로 자연스럽게 돌아가도록 돕습니다.

import Link from "next/link";
import BookCover from "@/components/BookCover";
import ButtonLink from "@/components/ButtonLink";
import ProgressLine from "@/components/ProgressLine";
import Shelf from "@/components/Shelf";
import {
  formatRelativeDay,
  getAllBooks,
  getBook,
  getBooksByStatus,
  getCurrentBook,
  getProgress,
  getReadingPlan,
  getRecall,
  getRecommendations,
  getWelcomeLine,
} from "@/lib/library";

export default function HomePage() {
  const book = getCurrentBook();

  if (!book) {
    return <p className="py-24 text-center text-muted">지금 읽고 있는 책이 없어요.</p>;
  }

  const plan = getReadingPlan(book.id);
  const recall = getRecall(book.id);
  const otherReading = getBooksByStatus("reading").filter((b) => b.id !== book.id);
  const shelfBooks = getAllBooks().filter((b) => b.status !== "reading");
  const nextPick = getRecommendations()[0];
  const nextPickBase = getBook(nextPick.basedOn);

  return (
    <div>
      {/* 인사 */}
      <section className="pt-8 md:pt-16">
        <h1 className="font-serif text-[28px] leading-snug font-medium md:text-[34px]">
          {getWelcomeLine(book)}
        </h1>
        {recall && (
          <p className="mt-3 max-w-xl font-serif text-[17px] leading-[1.8] text-ink-soft">
            {recall.summary}
          </p>
        )}
      </section>

      {/* 계속 읽기 */}
      <section className="mt-12 grid gap-10 md:mt-16 md:grid-cols-[260px_1fr] md:gap-16">
        <Link href={`/books/${book.id}`} className="relative mx-auto block w-44 md:mx-0 md:w-full">
          <div className="lamp-light absolute -inset-16 -z-10" />
          <BookCover title={book.title} author={book.author} cover={book.cover} coverImage={book.coverImage} />
        </Link>

        <div className="flex flex-col justify-end">
          <p className="text-[13px] text-muted">
            읽는 중 · 마지막으로 읽은 날 {formatRelativeDay(book.lastReadAt)}
          </p>
          <h2 className="mt-2 font-serif text-[30px] font-medium md:text-[38px]">{book.title}</h2>
          <p className="mt-1 text-[15px] text-ink-soft">{book.author}</p>

          <div className="mt-6 flex items-center gap-4">
            <ProgressLine value={getProgress(book)} className="max-w-60" />
            <span className="shrink-0 text-[13px] text-muted">현재 {book.currentPage}쪽</span>
          </div>

          {/* 오늘의 독서 제안 */}
          {plan && (
            <div className="mt-10">
              <p className="text-[13px] text-muted">오늘의 독서</p>
              <p className="mt-2 font-serif text-[21px] leading-snug">
                오늘은 {plan.toPage}쪽까지 읽어보세요.
              </p>
              <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">{plan.reason}</p>
              <p className="mt-3 text-[13px] text-muted tabular-nums">
                {plan.fromPage} → {plan.toPage}쪽 · 약 {plan.minutes}분
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-6">
            <ButtonLink href={`/books/${book.id}/read`}>계속 읽기</ButtonLink>
            <ButtonLink href={`/books/${book.id}/recall`} variant="quiet">
              맥락 다시보기
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* 함께 읽고 있는 다른 책 */}
      {otherReading.length > 0 && (
        <section className="mt-24">
          <h3 className="text-[13px] text-muted">함께 읽고 있는 책</h3>
          <div className="mt-5 space-y-6">
            {otherReading.map((b) => (
              <Link key={b.id} href={`/books/${b.id}`} className="group flex items-center gap-5">
                <BookCover title={b.title} author={b.author} cover={b.cover} className="w-14" />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-[17px] group-hover:text-accent">{b.title}</p>
                  <p className="mt-1 text-[13px] text-muted">
                    {b.currentPage}쪽 · {formatRelativeDay(b.lastReadAt)}
                  </p>
                  <ProgressLine value={getProgress(b)} className="mt-3 max-w-40" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 서재 미리보기 */}
      <section className="mt-20">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[13px] text-muted">서재에서</h3>
          <Link href="/library" className="text-[13px] text-ink-soft hover:text-ink">
            모두 보기
          </Link>
        </div>
        <div className="mt-2">
          <Shelf books={shelfBooks} />
        </div>
      </section>

      {/* 다음에 읽을 책 (추천 미리보기) */}
      <section className="mt-20">
        <h3 className="text-[13px] text-muted">다음에 읽을 책</h3>
        <Link href="/discover" className="group mt-5 flex gap-5">
          <BookCover title={nextPick.title} author={nextPick.author} cover={nextPick.cover} className="w-20" />
          <div className="max-w-md">
            <p className="font-serif text-[19px] group-hover:text-accent">{nextPick.title}</p>
            <p className="mt-1 text-[13px] text-muted">
              {nextPickBase ? `${nextPickBase.title}에서 이어지는 책` : nextPick.author}
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{nextPick.reason}</p>
          </div>
        </Link>
      </section>
    </div>
  );
}

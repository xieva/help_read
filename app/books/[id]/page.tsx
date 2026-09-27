// 책 상세 화면
// 주소가 /books/sapiens 라면, [id] 자리에 "sapiens"가 들어옵니다.

import Link from "next/link";
import { notFound } from "next/navigation";
import BookCover from "@/components/BookCover";
import ButtonLink from "@/components/ButtonLink";
import ProgressLine from "@/components/ProgressLine";
import {
  formatDate,
  formatRelativeDay,
  getAllBooks,
  getBook,
  getProgress,
  getReadingPlan,
  getRecall,
  getRecommendations,
  statusLabel,
} from "@/lib/library";

// 미리 만들어 둘 책 상세 페이지 목록
export function generateStaticParams() {
  return getAllBooks().map((book) => ({ id: book.id }));
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const plan = getReadingPlan(book.id);
  const recall = getRecall(book.id);
  const related = getRecommendations().find((r) => r.basedOn === book.id);

  return (
    <div>
      <Link href="/library" className="inline-block pt-6 text-[14px] text-muted hover:text-ink md:pt-10">
        ← 서재
      </Link>

      <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-[280px_1fr] md:gap-16">
        <div className="relative mx-auto w-48 md:mx-0 md:w-full">
          <div className="lamp-light absolute -inset-16 -z-10" />
          <BookCover title={book.title} author={book.author} cover={book.cover} coverImage={book.coverImage} />
        </div>

        <div>
          <p className="text-[13px] text-muted">{statusLabel[book.status]}</p>
          <h1 className="mt-2 font-serif text-[30px] leading-tight font-medium md:text-[40px]">{book.title}</h1>
          <p className="mt-2 text-[15px] text-ink-soft">{book.author}</p>
          <p className="mt-6 max-w-xl font-serif text-[16px] leading-[1.9] text-ink-soft">{book.description}</p>

          {/* 읽는 중인 책 */}
          {book.status === "reading" && (
            <>
              <div className="mt-10 max-w-md">
                <div className="flex items-baseline justify-between text-[13px] text-muted tabular-nums">
                  <span>
                    {book.currentPage} / {book.totalPages}쪽
                  </span>
                  <span>{getProgress(book)}%</span>
                </div>
                <ProgressLine value={getProgress(book)} className="mt-2" />
                <p className="mt-3 text-[13px] text-muted">
                  마지막으로 읽은 날 · {formatDate(book.lastReadAt)} ({formatRelativeDay(book.lastReadAt)})
                </p>
              </div>

              {plan && (
                <div className="mt-12">
                  <p className="text-[13px] text-muted">오늘의 독서</p>
                  <p className="mt-2 font-serif text-[21px]">오늘은 {plan.toPage}쪽까지 읽어보세요.</p>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">{plan.reason}</p>
                  <p className="mt-3 text-[13px] text-muted tabular-nums">
                    {plan.fromPage} → {plan.toPage}쪽 · 약 {plan.minutes}분
                  </p>
                </div>
              )}

              <div className="mt-8 flex items-center gap-6">
                <ButtonLink href={`/books/${book.id}/read`}>계속 읽기</ButtonLink>
                {recall && (
                  <ButtonLink href={`/books/${book.id}/recall`} variant="quiet">
                    맥락 다시보기
                  </ButtonLink>
                )}
              </div>

              {recall && (
                <div className="mt-14 max-w-xl bg-paper-deep/70 px-6 py-6 md:px-8">
                  <p className="text-[13px] text-muted">지난번 읽은 곳</p>
                  <p className="mt-2 font-serif text-[16px] leading-[1.9]">{recall.summary}</p>
                </div>
              )}
            </>
          )}

          {/* 다 읽은 책 */}
          {book.status === "finished" && (
            <div className="mt-10">
              <p className="text-[15px] text-ink-soft">
                {formatDate(book.finishedAt)}에 마지막 장을 덮었어요. · {book.totalPages}쪽
              </p>
              {related && (
                <Link href="/discover" className="group mt-10 flex max-w-md items-center gap-5">
                  <BookCover title={related.title} author={related.author} cover={related.cover} className="w-14" />
                  <div>
                    <p className="text-[13px] text-muted">이 책이 좋았다면</p>
                    <p className="mt-1 font-serif text-[17px] group-hover:text-accent">{related.title}</p>
                  </div>
                </Link>
              )}
            </div>
          )}

          {/* 읽고 싶은 책 */}
          {book.status === "want" && (
            <p className="mt-10 text-[15px] text-ink-soft">아직 펼치지 않은 책이에요. · {book.totalPages}쪽</p>
          )}
        </div>
      </div>
    </div>
  );
}

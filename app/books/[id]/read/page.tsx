// 독서 모드
// 종이책을 펼치기 직전, 화면을 어둡게 가라앉혀 책으로 들어가도록 돕습니다.

import Link from "next/link";
import { notFound } from "next/navigation";
import ChapterMap from "@/components/book/ChapterMap";
import ReadingTimer from "@/components/detail/ReadingTimer";
import { getBook, getBooksByStatus, getChapterAt, getChapterEnd, getReadingPlan } from "@/lib/library";

// 이 화면에서는 아이폰 상단 상태바도 어둡게
export const viewport = { themeColor: "#16130f" };

export function generateStaticParams() {
  return getBooksByStatus("reading").map((book) => ({ id: book.id }));
}

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const plan = getReadingPlan(id);
  const chapter = getChapterAt(book, book.currentPage);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-night text-night-ink">
      {/* 아주 희미한 스탠드 불빛 */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-20%] left-1/2 h-[900px] w-[900px] -translate-x-1/2"
        style={{ background: "radial-gradient(closest-side, rgba(255,214,160,0.09), rgba(255,214,160,0))" }}
      />

      <div className="relative flex items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))] md:px-12 md:pt-8">
        <Link href={`/books/${book.id}`} className="press text-[14px] text-night-ink/55 hover:text-night-ink">
          ← 돌아가기
        </Link>
        <p className="text-[13px] text-night-ink/45">{book.title}</p>
      </div>

      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-8 py-12">
        {chapter && (
          <p className="text-[13px] text-night-ink/50">
            {chapter.no}장 · {chapter.title}
          </p>
        )}
        <p className="mt-6 flex items-baseline gap-3">
          <span className="numeral text-[88px] leading-[0.9] md:text-[112px]">{book.currentPage}</span>
          <span className="font-serif text-[24px] text-night-ink/85 md:text-[28px]">쪽을 펼쳐주세요.</span>
        </p>

        {plan && chapter && (
          <>
            <p className="mt-10 font-serif text-[18px] leading-[1.8] text-night-ink/80">
              <span className="numeral">{plan.toPage}</span>쪽, {plan.headline}. 약 {plan.minutes}분.
            </p>
            <p className="mt-2 text-[14.5px] leading-[1.8] text-night-ink/50">{plan.reason}</p>
            <ChapterMap
              segments={[{ label: chapter.title, start: chapter.startPage, end: getChapterEnd(book, chapter) }]}
              current={book.currentPage}
              from={plan.fromPage}
              to={plan.toPage}
              showLabels={false}
              tone="night"
              className="mt-8"
            />
          </>
        )}

        <div className="mt-12 flex items-center justify-between">
          <ReadingTimer />
          <p className="text-[13px] text-night-ink/35">휴대폰은 잠시 내려두어도 괜찮아요</p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg px-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Link
          href={`/books/${book.id}`}
          className="press flex h-[54px] items-center justify-center rounded-[14px] border border-night-ink/20 text-[15px] text-night-ink/90 transition-colors hover:bg-night-ink/5"
        >
          오늘은 여기까지
        </Link>
      </div>
    </div>
  );
}

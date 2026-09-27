// 맥락 다시보기 화면
// 며칠 만에 돌아온 사람이 이전 내용을 떠올리고, 다시 책으로 들어가도록 돕습니다.
// (지금은 Mock Data, 나중에 AI 요약으로 바뀔 자리)

import Link from "next/link";
import { notFound } from "next/navigation";
import ButtonLink from "@/components/ButtonLink";
import { formatRelativeDay, getBook, getBooksByStatus, getReadingPlan, getRecall } from "@/lib/library";

export function generateStaticParams() {
  return getBooksByStatus("reading").map((book) => ({ id: book.id }));
}

export default async function RecallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  const recall = getRecall(id);
  if (!book || !recall) notFound();

  const plan = getReadingPlan(id);

  return (
    <article className="mx-auto max-w-xl">
      <Link href={`/books/${book.id}`} className="inline-block pt-6 text-[14px] text-muted hover:text-ink md:pt-10">
        ← {book.title}
      </Link>

      <p className="mt-12 text-[13px] text-muted">
        맥락 다시보기 · {formatRelativeDay(book.lastReadAt)} 읽은 곳
      </p>
      <p className="mt-4 font-serif text-[23px] leading-[1.75] md:text-[26px]">{recall.summary}</p>

      <section className="mt-14">
        <h2 className="text-[13px] text-muted">기억해두면 좋은 내용</h2>
        <ol className="mt-6 space-y-6">
          {recall.keyPoints.map((point, index) => (
            <li key={point} className="flex gap-5">
              <span className="w-4 shrink-0 pt-[3px] font-serif text-[14px] text-accent/80">{index + 1}</span>
              <p className="font-serif text-[17px] leading-[1.8] text-ink-soft">{point}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 border-t border-line pt-10">
        <p className="font-serif text-[19px] leading-relaxed">이제 {book.currentPage}쪽을 펼쳐볼까요?</p>
        {plan && <p className="mt-2 text-[15px] text-ink-soft">오늘은 {plan.toPage}쪽까지면 충분해요.</p>}
        <div className="mt-7">
          <ButtonLink href={`/books/${book.id}/read`}>계속 읽기</ButtonLink>
        </div>
        <p className="mt-10 text-[12px] leading-relaxed text-muted">
          기억을 되살리기 위한 짧은 정리예요. 이어지는 이야기는 책에서 만나세요.
        </p>
      </section>
    </article>
  );
}

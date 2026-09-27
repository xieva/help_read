// 책 상세: 책 한 권을 위한 개인적인 독서 공간
// 표지 색이 은은하게 번진 "그 책의 방"에서, 읽던 자리·오늘의 구간·지난 이야기·메모·도우미를 만납니다.

import Link from "next/link";
import { notFound } from "next/navigation";
import Book3D from "@/components/book/Book3D";
import BookCover from "@/components/book/BookCover";
import BookMorph from "@/components/book/BookMorph";
import ChapterMap from "@/components/book/ChapterMap";
import { AskButton, AssistantProvider, AssistantSuggestions } from "@/components/detail/Assistant";
import Memos from "@/components/detail/Memos";
import RecallContent from "@/components/detail/RecallContent";
import StartReading from "@/components/detail/StartReading";
import { PrimaryLink, TextAction } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";
import {
  daysSince,
  formatDate,
  formatRelativeDay,
  getAllBooks,
  getAssistantFor,
  getBook,
  getChapterAt,
  getChapterEnd,
  getFeaturedPick,
  getProgress,
  getReadingPlan,
  getRecall,
  getRecommendationsFor,
  getSegments,
  statusLabel,
} from "@/lib/library";

export function generateStaticParams() {
  return getAllBooks().map((book) => ({ id: book.id }));
}

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const plan = getReadingPlan(book.id);
  const recall = getRecall(book.id);
  const chapter = getChapterAt(book, book.currentPage);
  const segments = getSegments(book);
  const recs = getRecommendationsFor(book.id);
  const featured = getFeaturedPick();
  const whyNow = featured && featured.book.id === book.id ? featured : undefined;
  const memos = (book.memos ?? [])
    .slice()
    .sort((a, b) => b.page - a.page)
    .map((m) => ({ ...m, dateLabel: formatDate(m.date) }));
  const tint = book.cover.bg;

  return (
    <div className="relative overflow-x-clip">
      {/* 이 책의 방: 표지 색이 아주 옅게 번진 공간 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px] md:-top-20"
        style={{
          background: `linear-gradient(to bottom, color-mix(in oklab, ${tint} 14%, var(--color-paper)) 0%, color-mix(in oklab, ${tint} 6%, var(--color-paper)) 50%, var(--color-paper) 100%)`,
        }}
      />

      <div className="wrap pt-[max(12px,env(safe-area-inset-top))] md:pt-2">
        <div className="flex h-12 items-center justify-between">
          <Link href="/library" className="press inline-flex items-center gap-2 text-[14px] text-ink-2 hover:text-ink">
            <span aria-hidden>←</span> 서재
          </Link>
          <span className="eyebrow">{statusLabel[book.status]}</span>
        </div>

        <AssistantProvider assistant={getAssistantFor(book)} bookTitle={book.title} tint={tint}>
          <div className="md:grid md:grid-cols-12 md:gap-12 lg:gap-16">
            {/* 왼쪽: 책 */}
            <div className="md:col-span-5">
              <div className="relative flex h-[330px] items-center justify-center md:sticky md:top-6 md:h-[calc(100svh-120px)] md:max-h-[720px]">
                <div
                  aria-hidden
                  className="lamp pointer-events-none absolute top-1/2 left-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 md:h-[780px] md:w-[780px]"
                />
                <BookMorph id={book.id}>
                  <div>
                    <Book3D book={book} className="[--w:176px] md:[--w:270px] lg:[--w:300px]" />
                  </div>
                </BookMorph>
              </div>
            </div>

            {/* 오른쪽: 이 책과의 시간 */}
            <div className="md:col-span-7 md:pt-16 lg:pt-24">
              <p className="eyebrow">{book.genre}</p>
              <h1 className="mt-2 font-serif text-[38px] leading-[1.12] font-medium tracking-[-0.02em] md:text-[56px]">
                {book.title}
              </h1>
              <p className="mt-3 text-[15px] text-ink-2">
                {book.author}
                {book.authorOriginal && (
                  <span className="ml-2 font-serif text-[16px] text-ink-3 italic">{book.authorOriginal}</span>
                )}
              </p>
              <p className="mt-1.5 text-[13px] text-ink-3">
                {book.publisher} · <span className="numeral">{book.year}</span> ·{" "}
                <span className="numeral">{book.totalPages}</span>쪽{book.translator && ` · ${book.translator} 옮김`}
              </p>
              <p className="mt-7 max-w-xl font-serif text-[16.5px] leading-[1.9] text-ink-2">{book.description}</p>

              {/* 지금 이 책과의 관계 */}
              <div className="mt-12 max-w-xl">
                {book.status === "reading" && (
                  <>
                    <p className="eyebrow">마지막으로 읽은 곳</p>
                    {chapter && (
                      <p className="mt-2 font-serif text-[21px]">
                        {chapter.no}장 · {chapter.title}
                      </p>
                    )}
                    <p className="mt-1 text-[13.5px] text-ink-3">
                      <span className="numeral text-ink-2">{book.currentPage}</span>쪽 · {formatDate(book.lastReadAt)} (
                      {formatRelativeDay(book.lastReadAt)})
                    </p>
                    <ChapterMap segments={segments} current={book.currentPage} className="mt-7" />
                    <p className="mt-3 text-right text-[12px] text-ink-3">
                      <span className="numeral">{getProgress(book)}</span>% 지나옴
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
                      <PrimaryLink
                        href={`/books/${book.id}/read`}
                        sub={`${book.currentPage}쪽부터`}
                        className="w-full sm:w-auto"
                      >
                        이어 읽기
                      </PrimaryLink>
                      <div className="flex items-center justify-center gap-7 sm:justify-start">
                        {recall && <TextAction href="#recall">지난 내용 떠올리기</TextAction>}
                        <AskButton>도우미에게 묻기</AskButton>
                      </div>
                    </div>
                  </>
                )}

                {book.status === "finished" && (
                  <>
                    <p className="eyebrow">다 읽은 책</p>
                    <p className="mt-2 font-serif text-[22px] leading-snug">
                      {formatDate(book.finishedAt)}, 마지막 장을 덮었어요.
                    </p>
                    {book.startedAt && (
                      <p className="mt-1 text-[13.5px] text-ink-3">
                        {formatDate(book.startedAt)}부터{" "}
                        <span className="numeral">
                          {(daysSince(book.startedAt) ?? 0) - (daysSince(book.finishedAt) ?? 0)}
                        </span>
                        일 동안 함께했어요
                      </p>
                    )}
                    <div className="mt-6 flex gap-7">
                      <AskButton>다 읽은 뒤 이야기 나누기</AskButton>
                      {memos.length > 0 && <TextAction href="#memos">남긴 메모 보기</TextAction>}
                    </div>
                  </>
                )}

                {book.status === "want" && (
                  <>
                    <p className="eyebrow">담아둔 이유</p>
                    <p className="mt-2 font-serif text-[20px] leading-relaxed">{book.addedReason}</p>
                    <p className="mt-1 text-[13.5px] text-ink-3">
                      {formatDate(book.addedAt)}에 담음 · 하루 30분이면 약{" "}
                      <span className="numeral">{Math.max(1, Math.ceil(book.totalPages / 25 / 7))}</span>주
                    </p>
                    <div className="mt-8">
                      <StartReading title={book.title} />
                    </div>
                  </>
                )}
              </div>

              {/* 아래로 이어지는 이야기들 */}
              <div className="mt-20 space-y-16 md:mt-28 md:space-y-20">
                {whyNow && (
                  <DetailSection label="지금 읽기 좋은 이유">
                    <p className="font-serif text-[21px] leading-[1.65]">{whyNow.bridge}</p>
                    <p className="mt-4 text-[15px] leading-[1.8] text-ink-2">{whyNow.reason}</p>
                  </DetailSection>
                )}

                {plan && chapter && (
                  <DetailSection label="오늘의 독서" id="today">
                    <p className="font-serif text-[25px] leading-[1.45] md:text-[28px]">
                      <span className="numeral">{plan.fromPage}</span>
                      <span className="mx-2 text-ink-4">→</span>
                      <span className="numeral">{plan.toPage}</span>쪽, {plan.headline}
                    </p>
                    <p className="mt-3 text-[15px] leading-[1.8] text-ink-2">{plan.reason}</p>
                    <ChapterMap
                      segments={[{ label: chapter.title, start: chapter.startPage, end: getChapterEnd(book, chapter) }]}
                      current={book.currentPage}
                      from={plan.fromPage}
                      to={plan.toPage}
                      showLabels={false}
                      className="mt-7"
                    />
                    <p className="mt-3 text-[12.5px] text-ink-3">
                      약 <span className="numeral">{plan.minutes}</span>분 · 한 주제가 끝나는 곳에서 멈추도록 골랐어요
                    </p>
                  </DetailSection>
                )}

                {recall && (
                  <DetailSection label="지난 이야기" id="recall">
                    <RecallContent recall={recall} />
                  </DetailSection>
                )}

                <DetailSection label="나의 메모" id="memos" aside={memos.length ? `${memos.length}개` : undefined}>
                  <Memos memos={memos} currentPage={book.currentPage} />
                </DetailSection>

                <DetailSection label="독서 도우미">
                  <p className="mb-6 font-serif text-[21px] leading-snug">이 책과 이야기하기</p>
                  <AssistantSuggestions />
                </DetailSection>

                {recs.length > 0 && (
                  <DetailSection label="이 책에서 이어지는 책">
                    <div className="grid gap-8 sm:grid-cols-2">
                      {recs.map((r) => (
                        <Link key={r.id} href="/discover" className="group grid grid-cols-[76px_1fr] gap-5">
                          <BookCover
                            book={r}
                            className="book-lift w-full transition-transform duration-500 group-hover:-translate-y-1"
                          />
                          <div>
                            <p className="font-serif text-[17px] leading-snug">{r.title}</p>
                            <p className="mt-1 text-[12px] text-accent">{r.fit}</p>
                            <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.7] text-ink-2">{r.reason}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </DetailSection>
                )}
              </div>
            </div>
          </div>
        </AssistantProvider>
      </div>
      <div className="h-24" />
    </div>
  );
}

function DetailSection({
  label,
  aside,
  id,
  children,
}: {
  label: string;
  aside?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" className="max-w-xl scroll-mt-20">
      <div id={id} className="scroll-mt-20 border-t border-ink/10 pt-7">
        <div className="mb-6 flex items-baseline justify-between">
          <p className="eyebrow">{label}</p>
          {aside && <p className="text-[12px] text-ink-3">{aside}</p>}
        </div>
        {children}
      </div>
    </Reveal>
  );
}

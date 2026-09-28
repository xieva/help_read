// 홈 ("오늘")
// 대시보드가 아니라 "내 독서 세계"를 보여주는 화면입니다.
// 위에서부터: 지금 읽는 책 → 오늘의 독서 → 함께 펼쳐 둔 책 → 최근 다 읽은 책 → 다음에 읽을 책 → 어울릴 책

import { BRAND } from "@/lib/brand";
import Link from "next/link";
import BookCover from "@/components/book/BookCover";
import BookMorph from "@/components/book/BookMorph";
import ReadingShelf from "@/components/book/ReadingShelf";
import ChapterMap from "@/components/book/ChapterMap";
import HomeHero from "@/components/home/HomeHero";
import { Arrow } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import {
  formatMonth,
  getBook,
  getBooksByStatus,
  getChapterAt,
  getChapterEnd,
  getCurrentBook,
  getFeaturedPick,
  getReadingPlan,
  getRecall,
  getRecommendations,
  getRestLine,
  getReturnLine,
  getSegments,
} from "@/lib/library";

export default function HomePage() {
  const book = getCurrentBook();
  if (!book) return <p className="wrap py-32 text-center text-ink-3">지금 펼쳐 둔 책이 없어요.</p>;

  const plan = getReadingPlan(book.id);
  const recall = getRecall(book.id);
  const chapter = getChapterAt(book, book.currentPage);
  const others = getBooksByStatus("reading").filter((b) => b.id !== book.id);
  const finished = getBooksByStatus("finished");
  const want = getBooksByStatus("want");
  const featured = getFeaturedPick();
  const thisYear = new Date().getFullYear();
  const finishedThisYear = finished.filter((b) => b.finishedAt?.startsWith(String(thisYear))).length;

  // 최근 다 읽은 책 중, 밑줄 친 문장이 있는 메모 하나
  const quoted = finished
    .flatMap((b) => (b.memos ?? []).filter((m) => m.quote).map((m) => ({ book: b, memo: m })))
    .at(0);

  const next = getRecommendations().find((r) => r.basedOn === book.id);
  const nextFrom = next ? getBook(next.basedOn) : undefined;

  return (
    <div>
      <HomeHero
        book={book}
        segments={getSegments(book)}
        chapterLabel={chapter ? `${chapter.no}장 ‘${chapter.title}’` : undefined}
        returnLine={getReturnLine(book)}
        restLine={getRestLine(book)}
        recall={recall}
        plan={plan}
      />

      <div className="wrap mt-24 space-y-24 md:mt-20 md:space-y-32">
        {/* 오늘의 독서 */}
        {plan && chapter && (
          <Section
            id="today"
            label="오늘의 독서"
            aside={<span className="text-[14px] text-ink-2">약 <span className="numeral text-[16px]">{plan.minutes}</span>분</span>}
          >
            <p className="font-serif text-[27px] leading-[1.4] tracking-[-0.01em] md:text-[34px]">
              오늘은 <span className="numeral">{plan.toPage}</span>쪽,
              <br />
              {plan.headline}.
            </p>
            <p className="mt-4 max-w-xl text-[16px] leading-[1.8] text-ink-2">{plan.reason}</p>
            <div className="mt-9 max-w-xl">
              <ChapterMap
                segments={[{ label: chapter.title, start: chapter.startPage, end: getChapterEnd(book, chapter) }]}
                current={book.currentPage}
                from={plan.fromPage}
                to={plan.toPage}
                showLabels={false}
              />
              <div className="numeral mt-3 flex justify-between text-[12px] text-ink-3">
                <span>{chapter.no}장 시작 · {chapter.startPage}</span>
                <span className="text-accent">
                  {plan.fromPage} → {plan.toPage}
                </span>
                <span>{getChapterEnd(book, chapter)} · 끝</span>
              </div>
            </div>
          </Section>
        )}

        {/* 함께 펼쳐 둔 책 */}
        {others.length > 0 && (
          <Section label="함께 펼쳐 둔 책">
            <div className="space-y-12">
              {others.map((b) => {
                const p = getReadingPlan(b.id);
                const c = getChapterAt(b, b.currentPage);
                return (
                  <Link
                    key={b.id}
                    href={`/books/${b.id}`}
                    className="group grid grid-cols-[96px_1fr] items-center gap-7 md:grid-cols-[124px_1fr] md:gap-10"
                  >
                    <BookMorph id={b.id}>
                      <div className="-rotate-[3deg] transition-transform duration-700 ease-[var(--ease-book)] group-hover:rotate-0">
                        <BookCover book={b} className="book-pages w-full" />
                      </div>
                    </BookMorph>
                    <div>
                      <p className="font-serif text-[23px] leading-snug md:text-[28px]">{b.title}</p>
                      <p className="mt-1 text-[14px] text-ink-3">
                        <span className="numeral">{b.currentPage}</span> / <span className="numeral">{b.totalPages}</span>
                        쪽{c && ` · ${c.title}`} · {getRestLine(b)}
                      </p>
                      {p && (
                        <p className="mt-4 max-w-md text-[15px] leading-[1.7] text-ink-2">
                          {p.headline}, 약 {p.minutes}분이면 충분해요.
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-2 text-[14px] text-ink">
                        <span className="link-line">다시 펼치기</span>
                        <Arrow />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* 최근 다 읽은 책: 선반에 꽂힌 책등 */}
        <Section label="최근 다 읽은 책" aside={finishedThisYear > 0 ? `올해 ${finishedThisYear}권` : undefined}>
          <div className="md:grid md:grid-cols-9 md:items-end md:gap-12">
            <div className="md:col-span-5">
              <ReadingShelf books={finished.slice(0, 8)} />
            </div>

            {quoted && (
              <figure className="mt-10 md:col-span-4 md:mt-0 md:pb-8">
                <blockquote className="font-serif text-[22px] leading-[1.6] md:text-[25px]">
                  “{quoted.memo.quote}”
                </blockquote>
                <figcaption className="mt-4 text-[13px] text-ink-3">
                  {quoted.book.title} · <span className="numeral">{quoted.memo.page}</span>쪽에 남긴 밑줄 ·{" "}
                  {formatMonth(quoted.memo.date)}
                </figcaption>
                <p className="mt-3 text-[14.5px] leading-[1.7] text-ink-2">{quoted.memo.note}</p>
              </figure>
            )}
          </div>
        </Section>

        {/* 다음에 읽을 책: 쌓아 둔 책 */}
        {want.length > 0 && (
          <Section label="다음에 읽을 책" aside={`${want.length}권이 기다리는 중`}>
            <Link
              href="/library?filter=want"
              className="group flex flex-col gap-10 md:flex-row md:items-center md:gap-14"
            >
              <div className="relative h-[176px] w-[272px] shrink-0">
                {want.slice(0, 4).map((b, i) => (
                  <div
                    key={b.id}
                    className="absolute bottom-0"
                    style={{ left: i * 50, zIndex: i, transform: `rotate(${[-7, -2.5, 2, 6.5][i]}deg)` }}
                  >
                    <div
                      className="transition-transform duration-700 ease-[var(--ease-book)] group-hover:-translate-y-2 group-hover:translate-x-[calc(var(--i)*10px)]"
                      style={{ "--i": i } as React.CSSProperties}
                    >
                      <BookCover book={b} className="book-lift w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
              {featured && (
                <div className="max-w-md">
                  <p className="font-serif text-[22px] leading-[1.5]">
                    {featured.book.title}부터 시작해 보면 어때요?
                  </p>
                  <p className="mt-3 text-[15px] leading-[1.75] text-ink-2">
                    지금 읽는 {featured.from.title}에서 가장 자연스럽게 이어지는 책이에요. {featured.book.addedReason}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[14px]">
                    <span className="link-line">읽고 싶은 책 모두 보기</span>
                    <Arrow />
                  </span>
                </div>
              )}
            </Link>
          </Section>
        )}
      </div>

      {/* 당신에게 어울릴 책: 두 책을 잇는 다리 */}
      {next && nextFrom && (
        <Reveal as="section" className="mt-28 bg-paper-2/80 md:mt-36">
          <div className="wrap py-16 md:grid md:grid-cols-12 md:items-center md:gap-10 md:py-24">
            <div className="md:col-span-3">
              <p className="eyebrow">당신에게 어울릴 책</p>
              <p className="mt-1.5 text-[13px] text-ink-3">{next.fit}</p>
            </div>
            <div className="mt-10 flex items-end justify-center gap-4 md:col-span-4 md:mt-0">
              <BookCover book={nextFrom} className="book-lift w-[70px] opacity-90" />
              <div className="mb-10 flex items-center gap-1 text-ink-4" aria-hidden>
                <span className="h-px w-8 bg-current" />
                <span className="h-1.5 w-1.5 rounded-full border border-current" />
              </div>
              <BookCover book={next} className="book-pages w-[130px] md:w-[150px]" />
            </div>
            <div className="mt-10 md:col-span-5 md:mt-0">
              <p className="font-serif text-[30px] leading-tight md:text-[36px]">{next.title}</p>
              <p className="mt-2 text-[14px] text-ink-3">{next.author}</p>
              <p className="mt-5 font-serif text-[17px] leading-[1.85] text-ink-2">{next.reason}</p>
              <Link href="/discover" className="group mt-6 inline-flex items-center gap-2 text-[14px]">
                <span className="link-line">나에게 어울릴 책 더 보기</span>
                <Arrow />
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      <footer className="wrap py-16 text-center text-[12px] leading-relaxed text-ink-4">
        <p className="font-serif text-[14px] text-ink-3">{BRAND.name}</p>
        <p className="mt-1">읽던 곳으로 돌아오는 자리 · 지금 보이는 내용은 예시 데이터예요</p>
      </footer>
    </div>
  );
}

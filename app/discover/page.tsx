// 발견: AI 책 추천
// 표지를 늘어놓는 대신, "내가 읽은 책"과 "다음 책" 사이의 연결을 보여줍니다.

import Link from "next/link";
import Book3D from "@/components/book/Book3D";
import BookCover from "@/components/book/BookCover";
import BookMorph from "@/components/book/BookMorph";
import WantToggle from "@/components/discover/WantToggle";
import { PrimaryLink } from "@/components/ui/Buttons";
import Reveal from "@/components/ui/Reveal";
import { getFeaturedPick, getLikedBooks, getRecommendationThreads, statusLabel } from "@/lib/library";

export default function DiscoverPage() {
  const liked = getLikedBooks();
  const featured = getFeaturedPick();
  const threads = getRecommendationThreads();

  return (
    <div>
      {/* 머리말 */}
      <header className="wrap pt-[max(24px,env(safe-area-inset-top))] md:pt-10">
        <p className="eyebrow">발견</p>
        <h1 className="mt-3 font-serif text-[36px] leading-[1.18] font-medium tracking-[-0.02em] md:text-[60px]">
          당신에게 어울릴 책
        </h1>
        <div className="mt-8 flex items-center gap-5">
          <div className="flex -space-x-3">
            {liked.map((b, i) => (
              <Link
                key={b.id}
                href={`/books/${b.id}`}
                className="group relative block w-[46px]"
                style={{ zIndex: liked.length - i, transform: `rotate(${(i - 1) * 4}deg)` }}
              >
                <BookCover book={b} className="book-lift w-full transition-transform duration-500 group-hover:-translate-y-1" />
              </Link>
            ))}
          </div>
          <p className="max-w-sm text-[14.5px] leading-[1.7] text-ink-2">
            최근 즐겁게 읽은 <span className="text-ink">{liked.map((b) => b.title).join(", ")}</span>. 이 세 권에서
            출발했어요.
          </p>
        </div>
      </header>

      {/* 가장 먼저 권하는 한 권: 두 책을 잇는 다리 */}
      {featured && (
        <Reveal as="section" className="mt-16 bg-paper-2/80 md:mt-24">
          <div className="wrap py-16 md:grid md:grid-cols-12 md:items-center md:gap-12 md:py-24">
            <div className="relative flex items-end justify-center gap-5 md:col-span-5 md:gap-7">
              <div className="flex flex-col items-center">
                <BookCover book={featured.from} className="book-lift w-[64px] opacity-90 md:w-[84px]" />
                <p className="mt-3 text-[11px] text-ink-3">{statusLabel[featured.from.status]}</p>
              </div>
              <div className="mb-24 flex items-center gap-1 text-ink-4 md:mb-36" aria-hidden>
                <span className="h-px w-6 bg-current md:w-10" />
                <span className="h-1.5 w-1.5 rounded-full border border-current" />
                <span className="h-px w-6 bg-current md:w-10" />
              </div>
              <Link href={`/books/${featured.book.id}`} className="block">
                <BookMorph id={featured.book.id}>
                  <div>
                    <Book3D book={featured.book} className="[--w:150px] md:[--w:220px]" />
                  </div>
                </BookMorph>
              </Link>
            </div>

            <div className="mt-14 md:col-span-7 md:mt-0">
              <p className="eyebrow">서재에 담아둔 책 중에서, 지금 가장 잘 이어질 한 권</p>
              <h2 className="mt-3 font-serif text-[36px] leading-tight font-medium md:text-[48px]">
                {featured.book.title}
              </h2>
              <p className="mt-2 text-[14px] text-ink-3">
                {featured.book.author}
                {featured.book.authorOriginal && (
                  <span className="ml-2 font-serif text-[15px] italic">{featured.book.authorOriginal}</span>
                )}
              </p>
              <p className="mt-8 font-serif text-[21px] leading-[1.65] md:text-[24px]">“{featured.bridge}”</p>
              <p className="mt-5 max-w-xl text-[15.5px] leading-[1.85] text-ink-2">{featured.reason}</p>

              <dl className="mt-9 grid max-w-xl gap-6 sm:grid-cols-2">
                {featured.connections.map((c) => (
                  <div key={c.label} className="border-t border-ink/15 pt-4">
                    <dt className="text-[12px] text-accent">{c.label}</dt>
                    <dd className="mt-2 font-serif text-[16px] leading-[1.6]">{c.text}</dd>
                  </div>
                ))}
              </dl>

              <PrimaryLink href={`/books/${featured.book.id}`} className="mt-10 w-full sm:w-auto">
                이 책의 자리로 가기
              </PrimaryLink>
            </div>
          </div>
        </Reveal>
      )}

      {/* 내 책에서 이어지는 길들 */}
      <div className="wrap mt-20 space-y-20 md:mt-28 md:space-y-28">
        {threads.map((thread) => (
          <Reveal as="section" key={thread.fromBookId}>
            <div className="flex items-center gap-4 md:gap-5">
              {thread.from && (
                <Link href={`/books/${thread.from.id}`} className="w-9 shrink-0 md:w-11">
                  <BookCover book={thread.from} className="book-lift w-full" />
                </Link>
              )}
              <div>
                <h2 className="font-serif text-[21px] leading-snug md:text-[26px]">{thread.title}</h2>
                <p className="mt-1 text-[13px] text-ink-3">{thread.note}</p>
              </div>
            </div>

            <div className="no-scrollbar -mx-[22px] mt-9 flex snap-x snap-mandatory gap-8 overflow-x-auto px-[22px] pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-14 md:overflow-visible md:px-0">
              {thread.items.map((rec) => (
                <article
                  key={rec.id}
                  className="grid w-[82vw] max-w-[380px] shrink-0 snap-start grid-cols-[104px_1fr] gap-6 md:w-auto md:max-w-none md:grid-cols-[132px_1fr] md:gap-8"
                >
                  <BookCover book={rec} className="book-pages w-full self-start" />
                  <div>
                    <p className="text-[12px] text-accent">{rec.fit}</p>
                    <h3 className="mt-2 font-serif text-[21px] leading-snug md:text-[23px]">{rec.title}</h3>
                    <p className="mt-1 text-[13px] text-ink-3">
                      {rec.author} · <span className="numeral">{rec.totalPages}</span>쪽
                    </p>
                    <p className="mt-4 text-[14.5px] leading-[1.8] text-ink-2">{rec.reason}</p>
                    <div className="mt-3">
                      <WantToggle />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <p className="wrap mt-24 pb-16 text-[12px] leading-relaxed text-ink-4">
        추천은 서재의 책과 남긴 메모를 바탕으로 만들어져요. 지금 보이는 내용은 예시 데이터예요.
      </p>
    </div>
  );
}

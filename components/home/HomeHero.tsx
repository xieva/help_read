"use client";
// 홈의 첫 장면: 스탠드 불빛 아래 펼쳐 둔 책 한 권
// 스크롤하면 책이 아주 천천히 뒤로 물러나고, 불빛이 조금씩 옅어집니다.

import { BRAND } from "@/lib/brand";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Book } from "@/data/books";
import type { ReadingPlan, Recall } from "@/data/reading";
import type { Segment } from "@/lib/library";
import Book3D from "@/components/book/Book3D";
import BookMorph from "@/components/book/BookMorph";
import ChapterMap from "@/components/book/ChapterMap";
import RecallContent from "@/components/detail/RecallContent";
import { PrimaryLink, TextAction } from "@/components/ui/Buttons";
import Sheet from "@/components/ui/Sheet";
import DateLine from "./DateLine";

type Props = {
  book: Book;
  segments: Segment[];
  chapterLabel?: string;
  returnLine: string;
  restLine: string;
  recall?: Recall;
  plan?: ReadingPlan;
};

export default function HomeHero({ book, segments, chapterLabel, returnLine, restLine, recall, plan }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.94]);
  const lamp = useTransform(scrollYProgress, [0, 0.9], [1, 0.25]);
  const [recallOpen, setRecallOpen] = useState(false);

  return (
    <section className="relative overflow-x-clip">
      <div className="wrap pt-[max(20px,env(safe-area-inset-top))] md:pt-4">
        <div className="flex items-center justify-between md:hidden">
          <span className="font-serif text-[17px] tracking-[-0.01em]">{BRAND.name}</span>
          <DateLine />
        </div>
        <h1 className="mt-7 font-serif text-[29px] leading-[1.3] font-medium tracking-[-0.01em] md:mt-5 md:text-[44px] md:leading-[1.2]">
          {returnLine}
          <br />
          <span className="text-ink-3">읽던 곳은 그대로예요.</span>
        </h1>
      </div>

      <div className="wrap md:grid md:grid-cols-12 md:items-center md:gap-10">
        {/* 책이 놓인 자리 */}
        <div ref={stage} className="relative flex h-[304px] items-center justify-center md:col-span-6 md:h-[620px]">
          <motion.div
            aria-hidden
            className="lamp pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 md:h-[900px] md:w-[900px]"
            style={{ opacity: lamp }}
          />
          <motion.div style={{ y, scale }}>
            <Link href={`/books/${book.id}`} aria-label={`${book.title} 자세히 보기`} className="block">
              <BookMorph id={book.id}>
                <div>
                  <Book3D book={book} className="[--w:170px] md:[--w:290px]" />
                </div>
              </BookMorph>
            </Link>
          </motion.div>
        </div>

        {/* 책 이야기 */}
        <div className="md:col-span-6 lg:col-span-5 lg:col-start-8">
          <p className="eyebrow">지금 읽는 책</p>
          <h2 className="mt-1.5 font-serif text-[40px] leading-[1.1] font-medium tracking-[-0.02em] md:text-[60px]">
            {book.title}
          </h2>
          <p className="mt-3 text-[15px] text-ink-2">
            {book.author}
            {book.authorOriginal && (
              <span className="ml-2 font-serif text-[16px] text-ink-3 italic">{book.authorOriginal}</span>
            )}
          </p>

          <ChapterMap segments={segments} current={book.currentPage} className="mt-7 md:mt-9" />
          <div className="mt-4 flex items-baseline justify-between gap-4 text-[13px] text-ink-3">
            <span>
              <span className="numeral text-[15px] text-ink-2">{book.currentPage}</span>
              <span className="numeral"> / {book.totalPages}</span>쪽{chapterLabel && ` · ${chapterLabel}`}
            </span>
            <span className="shrink-0">{restLine}</span>
          </div>

          <div className="mt-7 flex flex-col gap-3 md:mt-9 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
            <PrimaryLink gated href={`/books/${book.id}/read`} sub={`${book.currentPage}쪽부터`} className="w-full sm:w-auto">
              이어 읽기
            </PrimaryLink>
            <div className="flex items-center justify-center gap-7 sm:justify-start">
              {recall && <TextAction onClick={() => setRecallOpen(true)}>지난 내용 떠올리기</TextAction>}
              {plan && <TextAction href="#today">오늘 어디까지</TextAction>}
            </div>
          </div>
        </div>
      </div>

      {recall && (
        <Sheet open={recallOpen} onClose={() => setRecallOpen(false)} label="지난 내용 떠올리기" tint={book.cover.bg}>
          <p className="eyebrow">
            지난 내용 떠올리기 · {book.title}
          </p>
          <div className="mt-5">
            <RecallContent recall={recall} />
          </div>
          <PrimaryLink gated href={`/books/${book.id}/read`} sub={`${book.currentPage}쪽부터`} className="mt-10 w-full">
            이제 이어 읽기
          </PrimaryLink>
        </Sheet>
      )}
    </section>
  );
}

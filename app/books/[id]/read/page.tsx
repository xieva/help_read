// 계속 읽기 화면
// 종이책을 펼치기 직전, 화면을 어둡게 가라앉혀 독서에 들어가도록 돕는 화면입니다.

import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getBooksByStatus, getReadingPlan } from "@/lib/library";

// 이 화면에서는 아이폰 상단 상태바 색도 어둡게
export const viewport = { themeColor: "#1e1b18" };

export function generateStaticParams() {
  return getBooksByStatus("reading").map((book) => ({ id: book.id }));
}

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const plan = getReadingPlan(id);

  return (
    // fixed inset-0: 화면 전체를 덮어서 메뉴도 잠시 가립니다
    <div className="fixed inset-0 z-50 flex flex-col bg-night px-8 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] text-night-ink">
      <Link href={`/books/${book.id}`} className="self-start text-[14px] text-night-ink/50 hover:text-night-ink">
        ← 돌아가기
      </Link>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <p className="text-[13px] text-night-ink/50">
          {book.title} · {book.author}
        </p>
        <p className="mt-5 font-serif text-[34px] leading-snug md:text-[40px]">
          {book.currentPage}쪽을
          <br />
          펼쳐주세요.
        </p>
        {plan && (
          <p className="mt-6 font-serif text-[16px] leading-[1.9] text-night-ink/70">
            {plan.toPage}쪽까지, 약 {plan.minutes}분.
            <br />
            {plan.reason}
          </p>
        )}
        <p className="mt-10 text-[13px] text-night-ink/40">휴대폰은 잠시 내려두어도 괜찮아요.</p>
      </div>

      <div className="mx-auto w-full max-w-md">
        <Link
          href={`/books/${book.id}`}
          className="flex h-12 items-center justify-center rounded-[3px] border border-night-ink/25 text-[15px] transition-colors hover:bg-night-ink/5"
        >
          오늘은 여기까지
        </Link>
      </div>
    </div>
  );
}

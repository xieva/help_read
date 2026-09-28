// "지난 내용 떠올리기"의 본문
// 홈에서는 시트 안에, 책 상세에서는 화면 안에 그대로 쓰입니다.

import type { Recall } from "@/data/reading";

export default function RecallContent({ recall, large = false }: { recall: Recall; large?: boolean }) {
  return (
    <div>
      <p className={`font-serif leading-[1.7] ${large ? "text-[24px] md:text-[28px]" : "text-[22px] md:text-[24px]"}`}>
        {recall.summary}
      </p>
      <p className="mt-6 border-l-2 border-accent/50 pl-4 font-serif text-[16px] leading-[1.85] text-ink-2">
        {recall.lastScene}
      </p>

      <p className="eyebrow mt-12">기억해두면 좋은 내용</p>
      <ol className="mt-5 space-y-5">
        {recall.keyPoints.map((point, i) => (
          <li key={point} className="grid grid-cols-[28px_1fr] items-baseline">
            <span className="numeral text-[19px] text-accent">{i + 1}</span>
            <p className="font-serif text-[17px] leading-[1.75]">{point}</p>
          </li>
        ))}
      </ol>

      <p className="eyebrow mt-12">다시 만날 개념</p>
      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {recall.concepts.map((c) => (
          <div key={c.term}>
            <dt className="font-serif text-[16px] font-medium">{c.term}</dt>
            <dd className="mt-1 text-[14px] leading-[1.7] text-ink-2">{c.description}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-[12px] leading-relaxed text-ink-3">
        기억을 되살리기 위한 짧은 정리예요. 이어지는 이야기는 책에서 만나세요.
      </p>
    </div>
  );
}

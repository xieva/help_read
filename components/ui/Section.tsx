// 편집 디자인의 기본 틀
// 모바일: 라벨이 위에 / 데스크톱: 라벨이 왼쪽 여백에 (책의 방주처럼)

import Reveal from "./Reveal";

type Props = {
  label: string;
  aside?: React.ReactNode; // 라벨 아래에 붙는 작은 정보
  children: React.ReactNode;
  id?: string;
  className?: string;
};

export default function Section({ label, aside, children, id, className = "" }: Props) {
  return (
    <Reveal as="section" className={`scroll-mt-24 ${className}`}>
      <div id={id} className="grid gap-5 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-3">
          <p className="eyebrow">{label}</p>
          {aside && <div className="mt-1.5 text-[13px] text-ink-3">{aside}</div>}
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </Reveal>
  );
}

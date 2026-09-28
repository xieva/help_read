// 진행 지도
// 퍼센트 막대 대신, 책을 부(部)나 장 단위로 나눠 "지금 책의 어디쯤에 있는지"를 보여줍니다.
// from/to 를 주면 오늘 읽을 구간이 포인트 색으로 표시됩니다.

import type { Segment } from "@/lib/library";

type Props = {
  segments: Segment[];
  current: number;
  from?: number;
  to?: number;
  showLabels?: boolean;
  tone?: "paper" | "night";
  className?: string;
};

export default function ChapterMap({
  segments,
  current,
  from,
  to,
  showLabels = true,
  tone = "paper",
  className = "",
}: Props) {
  const track = tone === "night" ? "bg-night-ink/15" : "bg-ink/10";
  const read = tone === "night" ? "bg-night-ink/55" : "bg-ink/55";
  const labelOn = tone === "night" ? "text-night-ink/80" : "text-ink-2";
  const labelOff = tone === "night" ? "text-night-ink/35" : "text-ink-4";

  return (
    <div className={className}>
      <div className="flex gap-[3px]">
        {segments.map((s) => {
          const length = s.end - s.start + 1;
          const pct = (page: number) => Math.min(100, Math.max(0, ((page - s.start + 1) / length) * 100));
          const readPct = pct(current);
          const todayStart = from !== undefined ? pct(from) : 0;
          const todayEnd = to !== undefined ? pct(to) : 0;
          const isHere = current >= s.start && current <= s.end;

          return (
            <div key={s.label + s.start} className="min-w-0" style={{ flexGrow: length, flexBasis: 0 }}>
              <div className={`relative h-[3px] ${track}`}>
                <div className={`absolute inset-y-0 left-0 ${read}`} style={{ width: `${readPct}%` }} />
                {to !== undefined && todayEnd > todayStart && (
                  <div
                    className="absolute inset-y-0 bg-accent"
                    style={{ left: `${todayStart}%`, width: `${todayEnd - todayStart}%` }}
                  />
                )}
                {isHere && (
                  <span
                    className={`absolute top-1/2 h-[9px] w-[9px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] ${
                      tone === "night" ? "border-night-ink bg-night" : "border-ink bg-paper"
                    }`}
                    style={{ left: `${readPct}%` }}
                  />
                )}
              </div>
              {showLabels && (
                <p className={`mt-2 truncate text-[11px] ${isHere ? labelOn : labelOff}`}>{s.label}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

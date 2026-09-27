// 얇은 진행률 선. 숫자보다 "어디쯤인지"를 조용히 보여줍니다.

export default function ProgressLine({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-[2px] w-full bg-line ${className}`}>
      <div className="h-full bg-accent/80" style={{ width: `${value}%` }} />
    </div>
  );
}

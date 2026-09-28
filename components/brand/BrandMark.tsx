// 앱 아이콘 B (책갈피 + r). 파비콘은 app/icon.svg, 홈 화면 아이콘은 app/apple-icon.png 와 같은 모양이에요.
export default function BrandMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#1c201e" />
      <path d="M20 0 H44 V52 L32 43.5 L20 52 Z" fill="#d9a45a" />
      <path
        d="M26.5 17 H31.2 V21.4 C32.6 18.3 35 16.6 38 16.6 C39 16.6 39.8 16.8 40.4 17.1 L39.6 22.4 C38.9 22.1 38.1 22 37.2 22 C33.6 22 31.3 24.8 31.3 29.4 V34.4 H34 V38 H25.8 V34.4 H27.6 V20.6 H26.5 Z"
        fill="#1c201e"
      />
    </svg>
  );
}

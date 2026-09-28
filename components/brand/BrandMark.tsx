// 리더 로고: 책갈피가 r 로 접힌 모양 (크림 바탕 + 잉크).
// 파비콘은 app/icon.svg, 홈 화면 아이콘은 app/apple-icon.png 와 같은 도형이에요.
export const BRAND_INK = "#1d2128";
export const BRAND_CREAM = "#f3efe8";

export function BrandGlyph({ color = BRAND_INK }: { color?: string }) {
  return (
    <>
      <path d="M19.13 50.42V20.2C19.13 16.6 22 13.7 25.6 13.7H36.49C34.2 13.9 32 16.5 32 20.66V50.42L25.55 45.1Z" fill={color} />
      <path d="M36.25 28.2V18.6C36.25 15.9 38.1 13.7 40.4 13.7C44.8 13.7 48.2 18.2 48.2 23.6C43.6 23.6 39.2 25.4 36.25 28.2Z" fill={color} />
    </>
  );
}

export default function BrandMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden>
      <rect x="0.5" y="0.5" width="63" height="63" rx="11.6" fill={BRAND_CREAM} stroke="#000" strokeOpacity="0.1" />
      <BrandGlyph />
    </svg>
  );
}

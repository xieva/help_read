// ─────────────────────────────────────────────────────────────
// 테마 (설정에서 고를 수 있어요)
// 색은 app/themes.css 에 있고, 여기에는 이름과 순서만 적어요.
// 새 테마를 추가하려면: 여기 목록에 한 줄 + themes.css 에 색 한 묶음.
// ─────────────────────────────────────────────────────────────

export type ThemeId = "night" | "paper" | "forest" | "dawn";

// swatch: [바탕, 포인트(조명), 글자, 책장 나무]
export const THEMES: { id: ThemeId; name: string; note: string; swatch: [string, string, string, string] }[] = [
  { id: "night", name: "서점의 밤", note: "스탠드 불빛과 월넛 책장", swatch: ["#1b1511", "#dba662", "#f2e9da", "#5d3c25"] },
  { id: "paper", name: "종이", note: "크림색 종이와 오크 책장", swatch: ["#f3efe8", "#9b5a33", "#1d2128", "#93643b"] },
  { id: "forest", name: "숲속 서재", note: "짙은 초록과 체리 원목", swatch: ["#151d18", "#cdb97e", "#e6ecde", "#6b4430"] },
  { id: "dawn", name: "새벽", note: "푸른 새벽빛과 물푸레나무", swatch: ["#171b23", "#b4c4e2", "#e4e8ef", "#6c645a"] },
];

export const DEFAULT_THEME: ThemeId = "night";
export const THEME_KEY = "reader.theme.v1";

// 화면이 그려지기 전에 테마를 적용하는 아주 짧은 스크립트 (깜빡임 방지)
export const themeBootScript = `try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.dataset.theme=["night","paper","forest","dawn"].indexOf(t)>-1?t:"${DEFAULT_THEME}"}catch(e){document.documentElement.dataset.theme="${DEFAULT_THEME}"}`;

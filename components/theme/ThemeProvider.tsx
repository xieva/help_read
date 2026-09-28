"use client";
// 지금 테마를 기억하고 바꿔주는 곳 (localStorage 에 저장)

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_KEY, THEMES, type ThemeId } from "@/lib/theme";

type ThemeContext = { theme: ThemeId; setTheme: (id: ThemeId) => void };
const Context = createContext<ThemeContext | null>(null);

export function useTheme() {
  const value = useContext(Context);
  if (!value) throw new Error("ThemeProvider 안에서 사용해 주세요.");
  return value;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as ThemeId | undefined;
    if (current && THEMES.some((t) => t.id === current)) setThemeState(current);
  }, []);

  // 테마가 바뀌면 화면과 아이폰 상단 색을 함께 바꿔요
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.theme = theme;
    const paper = getComputedStyle(html).getPropertyValue("--color-paper").trim();
    if (paper) document.querySelector('meta[name="theme-color"]')?.setAttribute("content", paper);
  }, [theme]);

  const setTheme = (id: ThemeId) => {
    setThemeState(id);
    try {
      localStorage.setItem(THEME_KEY, id);
    } catch {
      /* 저장이 안 돼도 이번 방문 동안은 적용돼요 */
    }
  };

  return <Context.Provider value={{ theme, setTheme }}>{children}</Context.Provider>;
}

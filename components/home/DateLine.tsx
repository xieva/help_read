"use client";
// "9월 27일 일요일 · 저녁" — 지금 시간에 맞춰 보여줍니다 (브라우저에서 계산)

import { useEffect, useState } from "react";

const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function partOfDay(hour: number) {
  if (hour < 5) return "깊은 밤";
  if (hour < 11) return "아침";
  if (hour < 17) return "오후";
  if (hour < 21) return "저녁";
  return "밤";
}

export default function DateLine({ className = "" }: { className?: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const now = new Date();
    setText(`${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]} · ${partOfDay(now.getHours())}`);
  }, []);
  return (
    <p className={`eyebrow min-h-[1.2em] transition-opacity duration-700 ${text ? "opacity-100" : "opacity-0"} ${className}`}>
      {text}
    </p>
  );
}

"use client";
// 독서 모드의 조용한 시계. 책을 펼친 뒤 흐른 시간만 작게 보여줍니다.

import { useEffect, useState } from "react";

export default function ReadingTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const t = window.setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <p className="text-[13px] text-night-ink/45">
      펼친 지 <span className="numeral text-night-ink/70">{mm}:{ss}</span>
    </p>
  );
}

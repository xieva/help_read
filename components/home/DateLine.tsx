"use client";
import { useEffect, useState } from "react";

export default function DateLine({ className = "" }: { className?: string }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const update = () => { const now = new Date(); setText(`${now.getMonth() + 1}.${now.getDate()}`); };
    update(); const timer = setInterval(update, 60000);
    document.addEventListener("visibilitychange", update);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  return <p className={`text-xs tabular-nums min-h-[1.2em] text-ink-2 ${className}`}>{text}</p>;
}

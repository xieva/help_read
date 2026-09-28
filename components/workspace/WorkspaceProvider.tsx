"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { decodeLibrary, LIBRARY_KEY, type PersonalBook } from "@/lib/user-library";

const PREVIEW_KEY = "reader.creator-preview.v1";
type Workspace = {
  books: PersonalBook[]; ready: boolean; preview: boolean; error: string;
  setPreview: (value: boolean) => void;
  saveBooks: (next: PersonalBook[]) => boolean;
};
const Context = createContext<Workspace | null>(null);
export const useWorkspace = () => { const value = useContext(Context); if (!value) throw new Error("Workspace is missing"); return value; };

export default function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<PersonalBook[]>([]);
  const [ready, setReady] = useState(false);
  const [preview, updatePreview] = useState(false);
  const [error, setError] = useState("");
  const lastSaved = useRef<string | null>(null);
  const readable = useRef(true);
  useEffect(() => {
    try { lastSaved.current = localStorage.getItem(LIBRARY_KEY); setBooks(decodeLibrary(lastSaved.current)); }
    catch { readable.current = false; setError("이 브라우저의 저장 공간을 읽지 못했어요. 기존 기록 보호를 위해 저장을 멈췄어요."); }
    try { updatePreview(sessionStorage.getItem(PREVIEW_KEY) === "on"); } catch { /* Preview still works in memory. */ }
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (e.key !== LIBRARY_KEY && e.key !== null) return;
      try { const raw = localStorage.getItem(LIBRARY_KEY); const next = decodeLibrary(raw); lastSaved.current = raw; setBooks(next); readable.current = true; setError(""); }
      catch { readable.current = false; setError("다른 탭의 기록을 읽지 못했어요. 새로고침 후 다시 확인해 주세요."); }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const setPreview = (value: boolean) => {
    updatePreview(value);
    try { if (value) sessionStorage.setItem(PREVIEW_KEY, "on"); else sessionStorage.removeItem(PREVIEW_KEY); } catch { /* Session-only preference. */ }
  };
  const saveBooks = (next: PersonalBook[]) => {
    if (!ready || !readable.current) return false;
    try {
      if (localStorage.getItem(LIBRARY_KEY) !== lastSaved.current) {
        setError("다른 탭에서 서재가 바뀌었어요. 새로고침한 뒤 다시 저장해 주세요."); return false;
      }
      const raw = JSON.stringify({ version: 1, books: next });
      localStorage.setItem(LIBRARY_KEY, raw);
      lastSaved.current = raw; setBooks(next); setError(""); return true;
    } catch { setError("저장하지 못했어요. 브라우저 저장 공간과 개인정보 보호 설정을 확인해 주세요."); return false; }
  };
  return <Context.Provider value={{ books, ready, preview, error, setPreview, saveBooks }}>{children}</Context.Provider>;
}

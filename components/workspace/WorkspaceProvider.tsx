"use client";
// 로그인한 사람의 서재(책 목록)를 불러오고 저장하는 곳
// 계정마다 저장 공간이 따로 있어요: localStorage "reader.user-library.v1:<계정 id>"

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { decodeLibrary, LIBRARY_KEY, libraryKey, type PersonalBook } from "@/lib/user-library";

type Workspace = {
  books: PersonalBook[];
  ready: boolean;
  error: string;
  saveBooks: (next: PersonalBook[]) => boolean;
};
const Context = createContext<Workspace | null>(null);
export const useWorkspace = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Workspace is missing");
  return value;
};

export default function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [books, setBooks] = useState<PersonalBook[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const lastSaved = useRef<string | null>(null);
  const readable = useRef(true);
  const key = user ? libraryKey(user.id) : null;

  useEffect(() => {
    if (!authReady) return;
    setError("");
    readable.current = true;
    if (!key) {
      setBooks([]);
      setReady(true);
      return;
    }
    try {
      // 로그인 기능이 생기기 전에 저장해 둔 책이 있으면, 처음 로그인한 계정의 서재로 옮겨요
      if (localStorage.getItem(key) === null) {
        const legacy = localStorage.getItem(LIBRARY_KEY);
        if (legacy) {
          localStorage.setItem(key, legacy);
          localStorage.removeItem(LIBRARY_KEY);
        }
      }
      lastSaved.current = localStorage.getItem(key);
      setBooks(decodeLibrary(lastSaved.current));
    } catch {
      readable.current = false;
      setError("이 브라우저의 저장 공간을 읽지 못했어요. 기존 기록 보호를 위해 저장을 멈췄어요.");
    }
    setReady(true);

    const sync = (e: StorageEvent) => {
      if (e.key !== key && e.key !== null) return;
      try {
        const raw = localStorage.getItem(key);
        const next = decodeLibrary(raw);
        lastSaved.current = raw;
        setBooks(next);
        readable.current = true;
        setError("");
      } catch {
        readable.current = false;
        setError("다른 탭의 기록을 읽지 못했어요. 새로고침 후 다시 확인해 주세요.");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key, authReady]);

  const saveBooks = (next: PersonalBook[]) => {
    if (!ready || !readable.current || !key) return false;
    try {
      if (localStorage.getItem(key) !== lastSaved.current) {
        setError("다른 탭에서 서재가 바뀌었어요. 새로고침한 뒤 다시 저장해 주세요.");
        return false;
      }
      const raw = JSON.stringify({ version: 1, books: next });
      localStorage.setItem(key, raw);
      lastSaved.current = raw;
      setBooks(next);
      setError("");
      return true;
    } catch {
      setError("저장하지 못했어요. 브라우저 저장 공간과 개인정보 보호 설정을 확인해 주세요.");
      return false;
    }
  };

  return <Context.Provider value={{ books, ready, error, saveBooks }}>{children}</Context.Provider>;
}

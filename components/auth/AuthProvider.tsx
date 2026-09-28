"use client";
// 로그인 상태를 앱 전체에 알려주는 곳
// - user: 로그인한 사람 (없으면 null → 미리보기만 가능)
// - view: 어드민이 지금 보고 있는 화면 ("creator" 제작자 / "user" 사용자)
// - gate(fn): 로그인했을 때만 fn 을 실행하고, 아니면 "로그인하면 쓸 수 있어요" 안내를 띄웁니다

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as auth from "@/lib/auth";
import Sheet from "@/components/ui/Sheet";

type View = "creator" | "user";
type AuthContext = {
  user: auth.User | null;
  ready: boolean;
  view: View;
  setView: (view: View) => void;
  signIn: typeof auth.signIn;
  signUp: typeof auth.signUp;
  signOut: () => void;
  gate: (action?: () => void) => boolean;
};

const Context = createContext<AuthContext | null>(null);
const VIEW_KEY = "reader.admin-view.v1";

export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error("AuthProvider 안에서 사용해 주세요.");
  return value;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<auth.User | null>(null);
  const [ready, setReady] = useState(false);
  const [view, updateView] = useState<View>("creator");
  const [prompt, setPrompt] = useState(false);

  useEffect(() => {
    setUser(auth.currentUser());
    try {
      updateView(sessionStorage.getItem(VIEW_KEY) === "user" ? "user" : "creator");
    } catch {
      /* 화면 선택은 저장 못 해도 괜찮아요 */
    }
    setReady(true);
    // 다른 탭에서 로그인/로그아웃하면 여기에도 반영
    const sync = () => setUser(auth.currentUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const setView = useCallback((next: View) => {
    updateView(next);
    try {
      sessionStorage.setItem(VIEW_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const value: AuthContext = {
    user,
    ready,
    view,
    setView,
    signIn: (email, password) => {
      const result = auth.signIn(email, password);
      if (result.user) {
        setUser(result.user);
        setView(result.user.role === "admin" ? "creator" : "user");
      }
      return result;
    },
    signUp: (email, name, password) => {
      const result = auth.signUp(email, name, password);
      if (result.user) {
        setUser(result.user);
        setView(result.user.role === "admin" ? "creator" : "user");
      }
      return result;
    },
    signOut: () => {
      auth.signOut();
      setUser(null);
    },
    gate: (action) => {
      if (user) {
        action?.();
        return true;
      }
      setPrompt(true);
      return false;
    },
  };

  return (
    <Context.Provider value={value}>
      {children}
      <Sheet open={prompt} onClose={() => setPrompt(false)} label="로그인 안내">
        <p className="eyebrow">미리보기 중</p>
        <p className="mt-3 font-serif text-[24px] leading-snug">로그인하면 쓸 수 있어요.</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          지금은 예시 서재를 둘러보는 중이에요. 가입하면 내 책을 꽂고, 메모와 독서 기록을 남길 수 있어요.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/login?mode=signup" onClick={() => setPrompt(false)} className="reader-button">
            회원가입
          </Link>
          <Link href="/login" onClick={() => setPrompt(false)} className="reader-button secondary">
            로그인
          </Link>
        </div>
      </Sheet>
    </Context.Provider>
  );
}

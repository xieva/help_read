"use client";
// 로그인 / 회원가입 화면 (한 화면에서 탭으로 전환)

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./AuthProvider";

export default function LoginView() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, ready, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // 이미 로그인한 상태로 들어오면 알맞은 첫 화면으로 보내요
  useEffect(() => {
    if (ready && user && !busy) router.replace(user.role === "admin" ? "/creator" : "/");
  }, [ready, user, busy, router]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "");
    const password = String(f.get("password") ?? "");
    setBusy(true);
    const result =
      mode === "signup"
        ? signUp(email, String(f.get("name") ?? ""), password)
        : signIn(email, password);
    if (result.error || !result.user) {
      setError(result.error ?? "다시 시도해 주세요.");
      setBusy(false);
      return;
    }
    router.replace(result.user.role === "admin" ? "/creator" : "/");
  };

  return (
    <div className="wrap flex min-h-[80dvh] flex-col justify-center py-12">
      <div className="mx-auto w-full max-w-[400px]">
        <Link href="/" className="font-serif text-[22px]">
          {BRAND.name}
        </Link>
        <h1 className="mt-8 text-[28px] font-semibold tracking-[-0.02em]">
          {mode === "signup" ? "내 책장 만들기" : "다시 오셨네요"}
        </h1>
        <p className="mt-2 text-[14.5px] text-ink-2">
          {mode === "signup" ? "이메일로 간단히 가입하고 바로 시작해요." : "로그인하고 읽던 책으로 돌아가요."}
        </p>

        <div className="mt-8 grid grid-cols-2 border-b border-rule text-[15px]" role="tablist">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`press -mb-px h-12 border-b-2 ${mode === m ? "border-ink text-ink" : "border-transparent text-ink-3"}`}
            >
              {m === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="reader-form mt-7" noValidate>
          <label>
            이메일
            <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
          </label>
          {mode === "signup" && (
            <label>
              이름
              <input name="name" autoComplete="nickname" required maxLength={30} placeholder="서재에 표시될 이름" />
            </label>
          )}
          <label>
            비밀번호
            <input
              name="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={8}
              placeholder={mode === "signup" ? "8자 이상" : ""}
            />
          </label>
          {error && (
            <p className="reader-error" role="alert">
              {error}
            </p>
          )}
          <button className="reader-button press mt-2 w-full" type="submit" disabled={busy}>
            {mode === "signup" ? "가입하고 시작하기" : "로그인"}
          </button>
        </form>

        <p className="mt-8 text-[12.5px] leading-relaxed text-ink-3">
          지금은 계정이 이 브라우저에만 저장돼요. 다른 기기에서는 다시 가입해야 해요.
        </p>
        <Link href="/" className="mt-6 inline-block text-[14px] text-ink-2 underline underline-offset-4">
          가입 없이 둘러보기
        </Link>
      </div>
    </div>
  );
}

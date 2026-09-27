// 버튼처럼 보이는 링크. primary(진한 버튼)와 quiet(글자만 있는 버튼) 두 가지 모양이 있어요.

import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "quiet";
};

export default function ButtonLink({ href, children, variant = "primary" }: Props) {
  const style =
    variant === "primary"
      ? "bg-ink text-paper hover:bg-ink/90 px-6"
      : "text-ink-soft hover:text-ink underline decoration-line underline-offset-[6px] hover:decoration-ink/40 px-1";

  return (
    <Link
      href={href}
      className={`inline-flex h-12 items-center justify-center rounded-[3px] text-[15px] transition-colors ${style}`}
    >
      {children}
    </Link>
  );
}

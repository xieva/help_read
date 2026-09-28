import Link from "next/link";

// 없는 주소로 들어왔을 때 보이는 화면
export default function NotFound() {
  return (
    <div className="py-32 text-center">
      <p className="font-serif text-[22px]">찾는 페이지가 없어요.</p>
      <Link href="/" className="mt-6 inline-block text-[14px] text-ink-soft underline underline-offset-[6px]">
        처음으로 돌아가기
      </Link>
    </div>
  );
}

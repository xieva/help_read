"use client";
// ─────────────────────────────────────────────────────────────
// 책 설정 서랍: 왼쪽 가장자리의 책갈피를 당기면 나와요.
// 설정을 늘리려면 아래 <Section>을 하나 더 넣으면 돼요.
// ─────────────────────────────────────────────────────────────

import PullDrawer from "@/components/ui/PullDrawer";
import { BookmarkArt, BookmarkPicker, type BookmarkId } from "./Bookmark";

type Props = {
  mark: BookmarkId;
  onMark: (id: BookmarkId) => void;
  reading: boolean; // 읽는 중인 책에만 책갈피가 꽂혀 있어요
};

export default function BookSettings({ mark, onMark, reading }: Props) {
  return (
    <PullDrawer label="책 설정" handle={<BookmarkArt id={mark} />}>
      <Section title="책갈피" note={reading ? "고른 무늬가 읽던 쪽에 꽂혀요." : "읽기 시작하면 이 무늬로 꽂혀요."}>
        <BookmarkPicker value={mark} onChange={onMark} />
      </Section>
    </PullDrawer>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="pd-section">
      <p className="eyebrow">{title}</p>
      {note && <p className="pd-section-note">{note}</p>}
      {children}
    </section>
  );
}

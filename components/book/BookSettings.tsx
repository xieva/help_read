"use client";
// ─────────────────────────────────────────────────────────────
// 책 설정
// - BookmarkTab: 책 왼쪽에 가로로 꽂혀 있는 책갈피. 누르거나 잡아당기면 설정 서랍이 나와요.
//   화면에 붙어 다니지 않고 책 옆에 고정돼 있어요 (스크롤하면 책과 함께 움직여요).
// - BookSettings: 나무 서랍 안의 설정들. 설정을 늘리려면 <Section>을 하나 더 넣으면 돼요.
// ─────────────────────────────────────────────────────────────

import { motion } from "motion/react";
import PullDrawer, { type DrawerState } from "@/components/ui/PullDrawer";
import { BookmarkArt, BookmarkPicker, type BookmarkId } from "./Bookmark";

export function BookmarkTab({ drawer, mark }: { drawer: DrawerState; mark: BookmarkId }) {
  return (
    <motion.button
      type="button"
      className="bm-tab"
      aria-label={drawer.open ? "책 설정 닫기" : "책 설정 열기 (책갈피를 잡아당겨도 열려요)"}
      style={{ x: drawer.tug }}
      {...drawer.handleProps}
    >
      <span className="bm-tab-ribbon">
        <span className="bm-tab-art">
          <BookmarkArt id={mark} />
        </span>
      </span>
      <span className="bm-tab-label">설정</span>
    </motion.button>
  );
}

type Props = {
  drawer: DrawerState;
  mark: BookmarkId;
  onMark: (id: BookmarkId) => void;
  reading: boolean; // 읽는 중인 책에만 책갈피가 꽂혀 있어요
};

export default function BookSettings({ drawer, mark, onMark, reading }: Props) {
  return (
    <PullDrawer drawer={drawer} label="책 설정">
      <Section title="책갈피" note={reading ? "고른 무늬가 읽던 쪽에 꽂혀요." : "읽기 시작하면 이 무늬로 꽂혀요."}>
        <BookmarkPicker value={mark} onChange={onMark} />
      </Section>
    </PullDrawer>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="pd-section">
      <p className="pd-section-title">{title}</p>
      {note && <p className="pd-section-note">{note}</p>}
      {children}
    </section>
  );
}

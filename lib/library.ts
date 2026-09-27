// ─────────────────────────────────────────────────────────────
// 화면은 데이터를 직접 가져오지 않고, 이 파일의 함수를 통해 가져옵니다.
//
// 나중에 Supabase(DB)나 AI를 연결할 때는 화면 코드는 그대로 두고
// 이 파일 안의 함수 내용만 바꾸면 됩니다.
// ─────────────────────────────────────────────────────────────

import { books, type Book, type BookStatus, type Chapter } from "@/data/books";
import { assistants, readingPlans, recalls, type Assistant } from "@/data/reading";
import { featuredPick, likedBookIds, recommendations, threads } from "@/data/recommendations";

// ── 책 ──────────────────────────────────────────────────────

export function getAllBooks(): Book[] {
  return books;
}

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function getBooksByStatus(status: BookStatus): Book[] {
  const list = books.filter((book) => book.status === status);
  // 읽는 중: 최근에 읽은 순 / 다 읽은 책: 최근에 다 읽은 순 / 읽고 싶은 책: 최근에 담은 순
  const key = (b: Book) =>
    status === "reading" ? b.lastReadAt : status === "finished" ? b.finishedAt : b.addedAt;
  return list.sort((a, b) => (key(b) ?? "").localeCompare(key(a) ?? ""));
}

// 홈에서 가장 크게 보여줄 책: 가장 최근에 읽은 "읽는 중" 책
export function getCurrentBook(): Book | undefined {
  return getBooksByStatus("reading")[0];
}

// ── AI가 만들어 줄 내용 (지금은 Mock) ─────────────────────────

export function getReadingPlan(bookId: string) {
  return readingPlans.find((plan) => plan.bookId === bookId);
}

export function getRecall(bookId: string) {
  return recalls.find((recall) => recall.bookId === bookId);
}

export function getAssistant(bookId: string) {
  return assistants.find((a) => a.bookId === bookId);
}

// ── 추천 ────────────────────────────────────────────────────

export function getLikedBooks(): Book[] {
  return likedBookIds.map((id) => getBook(id)).filter((b): b is Book => Boolean(b));
}

export function getFeaturedPick() {
  const book = getBook(featuredPick.bookId);
  const from = getBook(featuredPick.basedOn);
  if (!book || !from) return undefined;
  return { ...featuredPick, book, from };
}

export function getRecommendationThreads() {
  return threads
    .map((thread) => ({
      ...thread,
      from: getBook(thread.fromBookId),
      items: recommendations.filter((r) => r.basedOn === thread.fromBookId),
    }))
    .filter((t) => t.from && t.items.length > 0);
}

export function getRecommendationsFor(bookId: string) {
  return recommendations.filter((r) => r.basedOn === bookId);
}

export function getRecommendations() {
  return recommendations;
}

// ── 책 안의 위치 계산 ────────────────────────────────────────

export function getProgress(book: Book): number {
  if (book.totalPages === 0) return 0;
  return Math.round((book.currentPage / book.totalPages) * 100);
}

// 특정 쪽이 몇 장에 있는지
export function getChapterAt(book: Book, page: number): Chapter | undefined {
  if (!book.chapters) return undefined;
  return [...book.chapters].reverse().find((c) => c.startPage <= page);
}

// 장이 끝나는 쪽
export function getChapterEnd(book: Book, chapter: Chapter): number {
  const next = book.chapters?.find((c) => c.startPage > chapter.startPage);
  return next ? next.startPage - 1 : book.totalPages;
}

// 진행 지도에 쓰는 구간: 부(part)가 있으면 부 단위, 없으면 장 단위
export type Segment = { label: string; start: number; end: number };

export function getSegments(book: Book): Segment[] {
  const chapters = book.chapters;
  if (!chapters || chapters.length === 0) return [{ label: book.title, start: 1, end: book.totalPages }];

  const hasParts = chapters.some((c) => c.part);
  const segments: Segment[] = [];
  chapters.forEach((c) => {
    const label = hasParts ? c.part! : `${c.no}장`;
    const last = segments[segments.length - 1];
    if (hasParts && last && last.label === label) return;
    segments.push({ label, start: c.startPage, end: book.totalPages });
  });
  segments.forEach((s, i) => {
    if (segments[i + 1]) s.end = segments[i + 1].start - 1;
  });
  segments[0].start = 1;
  return segments;
}

// ── 날짜 표현 ────────────────────────────────────────────────

export const statusLabel: Record<BookStatus, string> = {
  reading: "읽는 중",
  finished: "읽음",
  want: "읽고 싶음",
};

export function daysSince(date?: string): number | undefined {
  if (!date) return undefined;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

// "오늘", "어제", "4일 전", "지난주", "3주 전", "2달 전"
export function formatRelativeDay(date?: string): string {
  const days = daysSince(date);
  if (days === undefined) return "";
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 14) return "지난주";
  if (days < 60) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}달 전`;
  return `${Math.floor(days / 365)}년 전`;
}

// "9월 23일"
export function formatDate(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// "2026년 7월"
export function formatMonth(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

const koreanDays = ["", "하루", "이틀", "사흘", "나흘", "닷새", "엿새", "이레"];

// 홈의 첫 문장. 돌아온 간격에 따라 말투가 달라집니다.
export function getReturnLine(book: Book): string {
  const days = daysSince(book.lastReadAt) ?? 0;
  if (days <= 1) return "어제 읽던 곳에서 이어가요.";
  if (days < koreanDays.length) return `${koreanDays[days]} 만이에요.`;
  return "오랜만이에요.";
}

export function getRestLine(book: Book): string {
  const days = daysSince(book.lastReadAt) ?? 0;
  if (days < koreanDays.length && days > 1) return `${koreanDays[days]}째 쉬는 중`;
  return `${formatRelativeDay(book.lastReadAt)} 마지막으로 읽음`;
}

// ── 독서 도우미 (지금은 Mock) ────────────────────────────────
// 책마다 준비된 질문이 없으면, 책 정보로 기본 질문을 만들어 줍니다.
// 나중에 실제 AI를 연결하면 이 부분이 AI 호출로 바뀝니다.


export function getAssistantFor(book: Book): Assistant {
  const specific = getAssistant(book.id);
  if (specific) return specific;

  const memo = book.memos?.find((m) => m.note);

  if (book.status === "want") {
    const weeks = Math.max(1, Math.ceil(book.totalPages / 25 / 7));
    return {
      bookId: book.id,
      scopeNote: "아직 펼치기 전이라, 결말이나 중요한 반전은 이야기하지 않아요.",
      suggestions: [
        {
          question: "스포일러 없이 어떤 책인지 알려줘",
          answer: [book.description, `하루 30분씩 읽으면 약 ${weeks}주 정도 함께하게 될 책이에요.`],
        },
        {
          question: "지금 읽기 좋은 이유가 있을까?",
          answer: [
            book.addedReason ?? "서재에 담아둔 책이에요.",
            "지금 읽고 있는 책과 주제가 가까워서, 앞의 책에서 생긴 질문을 이어 가며 읽기 좋아요.",
          ],
        },
      ],
    };
  }

  return {
    bookId: book.id,
    scopeNote:
      book.status === "finished"
        ? "끝까지 읽은 책이라 어떤 이야기든 함께 나눌 수 있어요."
        : `${book.currentPage}쪽까지 읽은 내용 안에서만 이야기해요.`,
    suggestions: [
      {
        question: "이 책을 한 문단으로 다시 정리해줘",
        answer: [
          book.description,
          "다 읽고 난 지금 다시 보면, 처음 펼쳤을 때와는 다른 문장들이 눈에 들어올 거예요.",
        ],
      },
      ...(memo
        ? [
            {
              question: "내가 남긴 메모로 이 책을 돌아보면?",
              answer: [
                `${memo.page}쪽에 남긴 메모가 이 책을 대하는 시선을 잘 보여줘요. “${memo.note}”`,
                "이 메모를 출발점으로, 비슷한 질문을 던지는 다른 책을 찾아볼 수도 있어요.",
              ],
            },
          ]
        : []),
      {
        question: "이 책 다음으로 무엇을 읽으면 좋을까?",
        answer: [
          "‘발견’에 이 책과 이어지는 책들을 모아두었어요.",
          "같은 질문을 다른 방향에서 비추는 책을 고르면, 이 책이 더 오래 기억에 남을 거예요.",
        ],
      },
    ],
  };
}

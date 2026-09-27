// ─────────────────────────────────────────────────────────────
// 화면(페이지)은 데이터를 직접 가져오지 않고, 이 파일의 함수를 통해 가져옵니다.
//
// 나중에 Supabase(데이터베이스)나 AI를 연결할 때는
// 화면 코드는 그대로 두고 이 파일 안의 내용만 바꾸면 됩니다.
// ─────────────────────────────────────────────────────────────

import {
  books,
  likedBookIds,
  readingPlans,
  recalls,
  recommendations,
  type Book,
  type BookStatus,
} from "@/data/books";

export function getAllBooks(): Book[] {
  return books;
}

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}

export function getBooksByStatus(status: BookStatus): Book[] {
  return books.filter((book) => book.status === status);
}

// 홈 화면에서 강조할 책: 읽는 중인 책 중 가장 최근에 읽은 책
export function getCurrentBook(): Book | undefined {
  return getBooksByStatus("reading").sort((a, b) =>
    (b.lastReadAt ?? "").localeCompare(a.lastReadAt ?? ""),
  )[0];
}

export function getReadingPlan(bookId: string) {
  return readingPlans.find((plan) => plan.bookId === bookId);
}

export function getRecall(bookId: string) {
  return recalls.find((recall) => recall.bookId === bookId);
}

export function getLikedBooks(): Book[] {
  return likedBookIds
    .map((id) => getBook(id))
    .filter((book): book is Book => book !== undefined);
}

export function getRecommendations() {
  return recommendations;
}

// ── 표시용 도우미 함수 ─────────────────────────────────────

export function getProgress(book: Book): number {
  if (book.totalPages === 0) return 0;
  return Math.round((book.currentPage / book.totalPages) * 100);
}

export const statusLabel: Record<BookStatus, string> = {
  reading: "읽는 중",
  finished: "완독",
  want: "읽고 싶음",
};

// 며칠 전인지 계산 (예: 4)
export function daysSince(date?: string): number | undefined {
  if (!date) return undefined;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

// "오늘", "어제", "4일 전"처럼 부드럽게 표현
export function formatRelativeDay(date?: string): string {
  const days = daysSince(date);
  if (days === undefined) return "";
  if (days === 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 14) return "지난주";
  if (days < 60) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}달 전`;
}

// "9월 23일"
export function formatDate(date?: string): string {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 홈 화면의 인사말. 오랜만에 돌아온 정도에 따라 말투를 바꿉니다.
export function getWelcomeLine(book: Book): string {
  const days = daysSince(book.lastReadAt) ?? 0;
  const korean = ["", "하루", "이틀", "사흘", "나흘", "닷새", "엿새", "이레"];
  if (days <= 1) return "어제 읽던 곳에서 이어가 볼까요.";
  if (days < korean.length) return `${korean[days]} 만이에요.`;
  return "오랜만이에요.";
}

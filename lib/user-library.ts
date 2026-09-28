import type { Book, BookStatus } from "@/data/books";
import { uid } from "./uid";

export const LIBRARY_KEY = "reader.user-library.v1";
// 계정마다 서재를 따로 저장해요. (로그인 기능 전의 기록은 LIBRARY_KEY 에 남아 있어요)
export const libraryKey = (userId: string) => `${LIBRARY_KEY}:${userId}`;
export type PersonalBook = Book & { note: string };
export type BookInput = { title: string; author: string; genre: string; totalPages: number; currentPage: number; status: BookStatus; note: string };

export function validateInput(input: BookInput): string | null {
  if (!input.title.trim() || !input.author.trim()) return "제목과 저자를 입력해 주세요.";
  if (input.title.trim().length > 120 || input.author.trim().length > 100) return "제목은 120자, 저자는 100자까지 입력할 수 있어요.";
  if (!Number.isInteger(input.totalPages) || input.totalPages < 1 || input.totalPages > 100000) return "전체 쪽수는 1~100,000 사이의 정수로 입력해 주세요.";
  if (!Number.isInteger(input.currentPage) || input.currentPage < 0 || input.currentPage > input.totalPages) return "읽은 쪽수는 0부터 전체 쪽수 사이로 입력해 주세요.";
  if (!["reading", "want", "finished"].includes(input.status)) return "독서 상태를 선택해 주세요.";
  if (input.note.length > 10000) return "메모는 10,000자까지 저장할 수 있어요.";
  return null;
}

export function makeBook(input: BookInput, previous?: PersonalBook): PersonalBook {
  const now = new Date().toISOString();
  const colors = ["#46544c", "#75615c", "#374758", "#a29379", "#756e84"];
  const color = colors[Array.from(input.title).reduce((n, c) => n + c.charCodeAt(0), 0) % colors.length];
  return {
    ...previous, ...input, id: previous?.id ?? uid("personal-"),
    title: input.title.trim(), author: input.author.trim(), genre: input.genre.trim() || "미분류",
    publisher: previous?.publisher ?? "", year: previous?.year ?? new Date().getFullYear(),
    addedAt: previous?.addedAt ?? now, lastReadAt: input.status === "reading" ? now : previous?.lastReadAt,
    finishedAt: input.status === "finished" ? previous?.finishedAt ?? now : undefined,
    currentPage: input.status === "finished" ? input.totalPages : input.status === "want" ? 0 : input.currentPage,
    description: "", note: input.note, cover: previous?.cover ?? { bg: color, ink: "#f5f1e8", style: "classic", size: 1 },
  };
}

export function decodeLibrary(raw: string | null): PersonalBook[] {
  if (!raw) return [];
  const value = JSON.parse(raw);
  if (value.version !== 1 || !Array.isArray(value.books)) throw new Error("저장 형식을 읽을 수 없어요.");
  const ids = new Set<string>();
  for (const b of value.books) {
    if (!b || typeof b.id !== "string" || !b.id.startsWith("personal-") || ids.has(b.id) ||
        typeof b.title !== "string" || typeof b.author !== "string" || typeof b.genre !== "string" ||
        typeof b.note !== "string" || !b.cover || !/^#[0-9a-f]{6}$/i.test(b.cover.bg) ||
        !/^#[0-9a-f]{6}$/i.test(b.cover.ink) || validateInput(b)) throw new Error("저장된 책 정보를 읽을 수 없어요.");
    ids.add(b.id);
  }
  return value.books;
}

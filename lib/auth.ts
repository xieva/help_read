// ─────────────────────────────────────────────────────────────
// 계정 (회원가입 · 로그인)
//
// 지금은 서버가 없어서, 계정을 "이 브라우저" 안에 저장합니다.
// 비밀번호는 그대로 저장하지 않고 salt + SHA-256 해시로 바꿔 저장해요.
//
// ⚠️ 한계: 브라우저 안에서만 확인하는 방식이라, 진짜 보안(다른 사람이 제작자 화면을 못 보게 막기,
//    다른 기기에서 로그인)은 서버(Supabase 등)를 연결해야 가능합니다.
//    나중에 Supabase Auth 로 바꿀 때는 이 파일의 함수 내용만 바꾸면 돼요.
// ─────────────────────────────────────────────────────────────

import { sha256 } from "./sha256";
import { uid } from "./uid";

// 이 이메일로 가입한 계정은 "제작자(어드민)"가 됩니다. 필요하면 여기에 추가하세요.
export const ADMIN_EMAILS = ["admin@reader.app"];

export type Role = "admin" | "user";
export type Account = {
  id: string;
  email: string;
  name: string;
  role: Role;
  salt: string;
  hash: string;
  createdAt: string;
};
export type User = Pick<Account, "id" | "email" | "name" | "role">;

const ACCOUNTS_KEY = "reader.accounts.v1";
const SESSION_KEY = "reader.session.v1";

function readAccounts(): Account[] {
  try {
    const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

const toUser = ({ id, email, name, role }: Account): User => ({ id, email, name, role });
const normalize = (email: string) => email.trim().toLowerCase();
const hashPassword = (salt: string, password: string) => sha256(`${salt}:${password}`);

export function validateSignUp(email: string, name: string, password: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "이메일 형식을 확인해 주세요.";
  if (!name.trim()) return "이름(닉네임)을 입력해 주세요.";
  if (name.trim().length > 30) return "이름은 30자까지 쓸 수 있어요.";
  if (password.length < 8) return "비밀번호는 8자 이상으로 정해 주세요.";
  return null;
}

export function signUp(email: string, name: string, password: string): { user?: User; error?: string } {
  const problem = validateSignUp(email, name, password);
  if (problem) return { error: problem };
  const accounts = readAccounts();
  const normalized = normalize(email);
  if (accounts.some((a) => a.email === normalized)) return { error: "이미 가입된 이메일이에요. 로그인해 주세요." };

  const salt = uid();
  const account: Account = {
    id: uid("user-"),
    email: normalized,
    name: name.trim(),
    role: ADMIN_EMAILS.includes(normalized) ? "admin" : "user",
    salt,
    hash: hashPassword(salt, password),
    createdAt: new Date().toISOString(),
  };
  writeAccounts([...accounts, account]);
  localStorage.setItem(SESSION_KEY, account.id);
  return { user: toUser(account) };
}

export function signIn(email: string, password: string): { user?: User; error?: string } {
  const account = readAccounts().find((a) => a.email === normalize(email));
  if (!account || account.hash !== hashPassword(account.salt, password)) {
    return { error: "이메일 또는 비밀번호가 맞지 않아요." };
  }
  localStorage.setItem(SESSION_KEY, account.id);
  return { user: toUser(account) };
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function currentUser(): User | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    const account = id ? readAccounts().find((a) => a.id === id) : undefined;
    return account ? toUser(account) : null;
  } catch {
    return null;
  }
}

export function countAccounts(): { total: number; admins: number } {
  const accounts = readAccounts();
  return { total: accounts.length, admins: accounts.filter((a) => a.role === "admin").length };
}

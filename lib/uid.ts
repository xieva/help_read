// 고유한 id 만들기
// crypto.randomUUID 는 https(또는 localhost)에서만 동작해서, 폰으로 http://192.168... 주소에 접속하면 에러가 나요.
// 그래서 어디서나 동작하는 getRandomValues 로 대신 만듭니다.
export function uid(prefix = ""): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

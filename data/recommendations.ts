// ─────────────────────────────────────────────────────────────
// AI 책 추천 (지금은 Mock Data)
// 나중에는 사용자의 서재·메모·취향 분석으로 만들어질 예정입니다.
// ─────────────────────────────────────────────────────────────

import type { Cover } from "./books";

export type Recommendation = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  cover: Cover;
  basedOn: string; // 어떤 책에서 이어지는지 (Book id)
  fit: string; // 짧은 성격. 예: "같은 저자의 다음 이야기"
  reason: string;
};

// 서재에 이미 담아둔 책 중, 지금 가장 잘 이어질 한 권
export const featuredPick = {
  bookId: "factfulness",
  basedOn: "sapiens",
  bridge: "인류가 걸어온 길을 따라왔다면, 이제 우리가 서 있는 ‘지금’을 볼 차례예요.",
  reason:
    "사피엔스에서 인간 사회가 변화해 온 과정을 흥미롭게 읽었다면, 이 책에서는 현대 세계를 데이터로 바라보는 또 다른 관점을 경험할 수 있어요.",
  connections: [
    { label: "이어지는 점", text: "인류 전체를 한 발 떨어져 바라보는 커다란 시선" },
    { label: "새로워지는 점", text: "과거가 아닌 지금, 이야기가 아닌 숫자로 보는 세계" },
  ],
};

// 추천의 바탕이 된 "최근 좋아한 책"
export const likedBookIds = ["sapiens", "justice", "economics-concert"];

// 추천이 이어지는 길 (책 한 권에서 출발하는 묶음)
export const threads = [
  {
    fromBookId: "sapiens",
    title: "사피엔스에서 이어지는 길",
    note: "거대한 시간 속에서 인간을 바라보는 책들",
  },
  {
    fromBookId: "justice",
    title: "정의란 무엇인가에서 이어지는 길",
    note: "옳음과 공정함에 대한 질문을 조금 더 가까이",
  },
  {
    fromBookId: "economics-concert",
    title: "경제학 콘서트에서 이어지는 길",
    note: "사람의 선택을 들여다보는 경제 이야기",
  },
  {
    fromBookId: "demian",
    title: "조금 다른 결로, 데미안을 오래 기억한다면",
    note: "자기 자신에게 이르는 길을 다룬 소설들",
  },
];

export const recommendations: Recommendation[] = [
  {
    id: "homo-deus",
    title: "호모 데우스",
    author: "유발 하라리",
    totalPages: 632,
    cover: { bg: "#2F3D46", ink: "#EDE3CF", accent: "#C58B52", style: "classic" },
    basedOn: "sapiens",
    fit: "같은 저자의 다음 이야기",
    reason: "사피엔스가 ‘우리는 어떻게 여기까지 왔는가’를 묻는다면, 이 책은 ‘이제 어디로 가는가’를 물어요. 다 읽을 즈음 펼치기 좋은 책이에요.",
  },
  {
    id: "short-history",
    title: "거의 모든 것의 역사",
    author: "빌 브라이슨",
    totalPages: 560,
    cover: { bg: "#D8C9A7", ink: "#2C3B32", accent: "#9C4A2C", style: "band" },
    basedOn: "sapiens",
    fit: "더 가벼운 호흡",
    reason: "우주의 탄생부터 인류까지, 사피엔스보다 더 긴 시간을 훨씬 유쾌한 문장으로 따라가요. 무거운 장을 읽은 날 쉬어가기 좋아요.",
  },
  {
    id: "tyranny-of-merit",
    title: "공정하다는 착각",
    author: "마이클 샌델",
    totalPages: 424,
    cover: { bg: "#EFE9DD", ink: "#1F2B3F", accent: "#B23A2A", style: "type" },
    basedOn: "justice",
    fit: "같은 질문, 지금의 이야기",
    reason: "정의란 무엇인가에서 던진 질문을 오늘의 능력주의로 옮겨 와요. 트롤리 문제에서 멈칫했던 그 감각이 다시 떠오를 거예요.",
  },
  {
    id: "what-money-cant-buy",
    title: "돈으로 살 수 없는 것들",
    author: "마이클 샌델",
    totalPages: 336,
    cover: { bg: "#5A6B5D", ink: "#F1EADB", accent: "#E0C58F", style: "frame" },
    basedOn: "justice",
    fit: "일상에 가까운 윤리",
    reason: "시장과 돈이 어디까지 들어와도 괜찮은지 묻는 책이에요. 경제학 콘서트와 정의란 무엇인가 사이 어딘가에 있는 책이기도 해요.",
  },
  {
    id: "nudge",
    title: "넛지",
    author: "리처드 탈러, 캐스 선스타인",
    totalPages: 528,
    cover: { bg: "#B5763A", ink: "#FBF3E4", accent: "#2A2622", style: "minimal" },
    basedOn: "economics-concert",
    fit: "사람은 늘 합리적이지 않다",
    reason: "경제학 콘서트처럼 일상의 장면에서 경제를 읽어내지만, 사람이 왜 늘 합리적으로 선택하지는 않는지에 초점을 맞춰요.",
  },
  {
    id: "thinking-fast-slow",
    title: "생각에 관한 생각",
    author: "대니얼 카너먼",
    totalPages: 728,
    cover: { bg: "#F0EBE0", ink: "#1D1A17", accent: "#2F5A7A", style: "frame" },
    basedOn: "economics-concert",
    fit: "인간 본성의 법칙과도 닮은",
    reason: "지금 읽고 있는 인간 본성의 법칙 1장, ‘감정이 먼저 결정한다’는 메모와 정확히 이어지는 책이에요. 그 생각을 실험으로 증명해요.",
  },
  {
    id: "siddhartha",
    title: "싯다르타",
    author: "헤르만 헤세",
    totalPages: 208,
    cover: { bg: "#C7A266", ink: "#2B2016", accent: "#6C3E22", style: "minimal" },
    basedOn: "demian",
    fit: "같은 작가의 또 다른 길",
    reason: "데미안의 싱클레어가 알을 깨고 나왔다면, 싯다르타는 그 이후의 긴 여정을 걸어요. 조용한 저녁에 천천히 읽기 좋은 책이에요.",
  },
  {
    id: "beneath-the-wheel",
    title: "수레바퀴 아래서",
    author: "헤르만 헤세",
    totalPages: 256,
    cover: { bg: "#3E4A5A", ink: "#EAE1CF", accent: "#B78B5B", style: "classic" },
    basedOn: "demian",
    fit: "데미안 이전의 헤세",
    reason: "기대에 맞춰 살아가던 소년이 조금씩 부서져 가는 이야기예요. 데미안을 읽으며 남긴 ‘용기’라는 메모와 반대편에서 만나는 책이에요.",
  },
];

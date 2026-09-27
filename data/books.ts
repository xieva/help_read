// ─────────────────────────────────────────────────────────────
// Mock Data (가짜 데이터)
//
// 지금은 실제 데이터베이스나 AI 없이, 이 파일에 적힌 내용으로 화면을 그립니다.
// 책을 추가하거나 문구를 바꾸고 싶다면 이 파일만 수정하면 됩니다.
// ─────────────────────────────────────────────────────────────

// 책의 상태: 읽는 중 / 완독 / 읽고 싶음
export type BookStatus = "reading" | "finished" | "want";

export type Book = {
  id: string; // 주소(URL)에 쓰이는 영문 이름. 예: /books/sapiens
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  lastReadAt?: string; // 마지막으로 읽은 날짜 (예: "2026-09-23")
  finishedAt?: string; // 다 읽은 날짜
  description: string; // 책 소개 한두 문장

  // 표지 그림이 없을 때 쓰는 placeholder 표지 설정
  cover: {
    color: string; // 표지 바탕색
    ink: string; // 표지 글자색
    size?: number; // 서재에서 보이는 책 크기 (1이 기본, 실제 책처럼 조금씩 다르게)
  };
  coverImage?: string; // 나중에 실제 표지 이미지 주소를 넣을 자리
};

// 오늘의 독서 제안 (나중에는 AI가 챕터·주제 단위를 분석해서 만들 예정)
export type ReadingPlan = {
  bookId: string;
  fromPage: number;
  toPage: number;
  minutes: number;
  reason: string;
};

// 맥락 다시보기 (나중에는 AI가 만든 요약으로 바뀔 예정)
export type Recall = {
  bookId: string;
  summary: string;
  keyPoints: string[];
};

// AI 책 추천 (나중에는 사용자 취향 분석으로 바뀔 예정)
export type Recommendation = {
  id: string;
  title: string;
  author: string;
  basedOn: string; // 어떤 책을 바탕으로 추천했는지 (Book의 id)
  reason: string;
  cover: Book["cover"];
};

// 오늘 기준으로 며칠 전 날짜를 만들어주는 작은 도우미 함수
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export const books: Book[] = [
  {
    id: "sapiens",
    title: "사피엔스",
    author: "유발 하라리",
    totalPages: 636,
    currentPage: 143,
    status: "reading",
    lastReadAt: daysAgo(4),
    description:
      "보잘것없는 유인원이었던 호모 사피엔스가 어떻게 지구의 지배자가 되었는지, 인지혁명과 농업혁명, 과학혁명을 따라가는 인류의 긴 이야기.",
    cover: { color: "#A0522D", ink: "#F6EBDD", size: 1.04 },
  },
  {
    id: "laws-of-human-nature",
    title: "인간 본성의 법칙",
    author: "로버트 그린",
    totalPages: 872,
    currentPage: 214,
    status: "reading",
    lastReadAt: daysAgo(11),
    description:
      "사람들은 왜 그렇게 행동하는가. 질투, 자기애, 비합리성처럼 우리 안에 있는 본성을 역사 속 인물들의 이야기로 풀어낸다.",
    cover: { color: "#2B2A28", ink: "#D9C9A8", size: 1.1 },
  },
  {
    id: "demian",
    title: "데미안",
    author: "헤르만 헤세",
    totalPages: 232,
    currentPage: 232,
    status: "finished",
    finishedAt: daysAgo(40),
    description:
      "알을 깨고 나오려는 한 소년, 싱클레어의 성장 이야기. 선과 악, 두 세계 사이에서 자기 자신에게 이르는 길을 찾는다.",
    cover: { color: "#3F5443", ink: "#EDE6D3", size: 0.9 },
  },
  {
    id: "justice",
    title: "정의란 무엇인가",
    author: "마이클 샌델",
    totalPages: 443,
    currentPage: 443,
    status: "finished",
    finishedAt: daysAgo(72),
    description:
      "무엇이 옳은 일인가. 트롤리 딜레마부터 공리주의와 자유주의까지, 일상의 질문을 통해 정의에 대해 함께 생각하게 만드는 책.",
    cover: { color: "#E8E0CF", ink: "#2F3A4A", size: 1.0 },
  },
  {
    id: "economics-concert",
    title: "경제학 콘서트",
    author: "팀 하포드",
    totalPages: 384,
    currentPage: 384,
    status: "finished",
    finishedAt: daysAgo(120),
    description:
      "커피 한 잔 가격부터 교통 체증까지, 일상 속 경제 원리를 탐정처럼 파헤치는 친절한 경제학 입문서.",
    cover: { color: "#C49A45", ink: "#2A2622", size: 0.96 },
  },
  {
    id: "cosmos",
    title: "코스모스",
    author: "칼 세이건",
    totalPages: 719,
    currentPage: 0,
    status: "want",
    description:
      "우주의 탄생과 생명의 기원, 그리고 그 안의 우리. 과학을 가장 아름다운 문장으로 들려주는 고전.",
    cover: { color: "#1F2A36", ink: "#E9DFC8", size: 1.08 },
  },
  {
    id: "guns-germs-steel",
    title: "총, 균, 쇠",
    author: "재레드 다이아몬드",
    totalPages: 752,
    currentPage: 0,
    status: "want",
    description:
      "왜 어떤 문명은 다른 문명을 정복할 수 있었을까. 지리와 환경이라는 새로운 시선으로 인류사를 다시 읽는다.",
    cover: { color: "#7B3B2E", ink: "#EFE3CF", size: 1.02 },
  },
];

export const readingPlans: ReadingPlan[] = [
  {
    bookId: "sapiens",
    fromPage: 143,
    toPage: 168,
    minutes: 30,
    reason: "여기에서 농업혁명 이야기가 마무리되어, 다음에 다시 시작하기 좋아요.",
  },
  {
    bookId: "laws-of-human-nature",
    fromPage: 214,
    toPage: 241,
    minutes: 35,
    reason: "6장 ‘공격성’이 끝나는 곳이에요. 한 인물의 이야기를 끝까지 따라갈 수 있어요.",
  },
];

export const recalls: Recall[] = [
  {
    bookId: "sapiens",
    summary:
      "지난번에는 인류가 수렵채집 사회에서 정착 생활로 변화하는 과정까지 읽었어요.",
    keyPoints: [
      "농업혁명은 식량 생산량을 늘렸다.",
      "하지만 개인의 삶이 반드시 더 편해진 것은 아니었다.",
      "사회 구조가 점점 복잡해지기 시작했다.",
    ],
  },
  {
    bookId: "laws-of-human-nature",
    summary:
      "지난번에는 사람들이 자기 자신을 실제보다 더 좋게 보려는 ‘자기애’에 관한 장을 읽었어요.",
    keyPoints: [
      "건강한 자기애는 타인에게 공감하는 힘이 된다.",
      "지나친 자기애는 관계를 조금씩 무너뜨린다.",
      "다른 사람의 행동보다 그 뒤의 동기를 보라고 말한다.",
    ],
  },
];

// 추천의 바탕이 된 "최근 좋아한 책"
export const likedBookIds = ["sapiens", "justice", "economics-concert"];

export const recommendations: Recommendation[] = [
  {
    id: "factfulness",
    title: "팩트풀니스",
    author: "한스 로슬링",
    basedOn: "sapiens",
    reason:
      "사피엔스를 흥미롭게 읽었다면, 인간 사회와 세계를 데이터 기반으로 바라보는 이 책도 잘 맞을 가능성이 높아요.",
    cover: { color: "#D8CDB6", ink: "#8C3B24" },
  },
  {
    id: "what-money-cant-buy",
    title: "돈으로 살 수 없는 것들",
    author: "마이클 샌델",
    basedOn: "justice",
    reason:
      "정의란 무엇인가에서 던진 질문을 시장과 돈의 문제로 옮겨 온 책이에요. 같은 목소리로 조금 더 일상에 가까운 이야기를 해요.",
    cover: { color: "#5A6B5D", ink: "#F1EADB" },
  },
  {
    id: "nudge",
    title: "넛지",
    author: "리처드 탈러, 캐스 선스타인",
    basedOn: "economics-concert",
    reason:
      "경제학 콘서트처럼 일상의 장면에서 경제를 읽어내는 책이에요. 사람이 왜 늘 합리적으로 선택하지는 않는지에 초점을 맞춰요.",
    cover: { color: "#B5763A", ink: "#FBF3E4" },
  },
];

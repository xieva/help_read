// ─────────────────────────────────────────────────────────────
// AI가 만들어 줄 내용들 (지금은 Mock Data)
//
// - 오늘의 독서 제안: 나중에 AI가 챕터·주제 단위를 분석해서 만듦
// - 지난 내용 떠올리기: 나중에 AI 요약으로 바뀜
// - 독서 도우미: 나중에 책별 AI 대화로 바뀜
// ─────────────────────────────────────────────────────────────

export type ReadingPlan = {
  bookId: string;
  fromPage: number;
  toPage: number;
  minutes: number;
  headline: string; // 예: "5장이 끝나는 곳까지"
  reason: string;
};

export type Recall = {
  bookId: string;
  summary: string;
  lastScene: string; // 마지막으로 읽은 장면
  keyPoints: string[];
  concepts: { term: string; description: string }[];
};

export type AssistantQA = {
  question: string;
  answer: string[]; // 문단 단위
};

export type Assistant = {
  bookId: string;
  scopeNote: string; // 스포일러 방지 안내
  suggestions: AssistantQA[];
};

export const readingPlans: ReadingPlan[] = [
  {
    bookId: "sapiens",
    fromPage: 143,
    toPage: 168,
    minutes: 30,
    headline: "5장이 끝나는 곳까지",
    reason: "농업혁명이 왜 ‘사기’였는지에 대한 이야기가 여기서 마무리돼요. 다음에는 6장 ‘피라미드 건설’부터 새로 시작할 수 있어요.",
  },
  {
    bookId: "laws-of-human-nature",
    fromPage: 82,
    toPage: 88,
    minutes: 10,
    headline: "2장의 마지막 여섯 쪽",
    reason: "‘자기도취의 법칙’이 거의 끝나가요. 짧게 마무리해 두면, 다음엔 3장을 처음부터 가볍게 시작할 수 있어요.",
  },
];

export const recalls: Recall[] = [
  {
    bookId: "sapiens",
    summary:
      "지난번에는 인류가 수렵채집 사회에서 정착 생활로 변화하는 과정까지 읽었어요.",
    lastScene:
      "밀을 기르기 시작한 사람들이 오히려 더 오래, 더 고되게 일하게 되었다는 이야기의 한가운데에서 멈췄어요.",
    keyPoints: [
      "농업혁명은 식량 생산량을 늘렸다.",
      "하지만 개인의 삶이 반드시 더 편해진 것은 아니었다.",
      "사회 구조가 점점 복잡해지기 시작했다.",
    ],
    concepts: [
      { term: "인지혁명", description: "약 7만 년 전, 사피엔스가 허구를 말하고 함께 믿을 수 있게 된 변화." },
      { term: "농업혁명", description: "약 1만 2천 년 전, 식물과 동물을 길들이며 한곳에 정착하기 시작한 변화." },
      { term: "사치의 덫", description: "삶을 편하게 하려고 만든 것이 어느새 새로운 의무가 되어버리는 현상." },
    ],
  },
  {
    bookId: "laws-of-human-nature",
    summary:
      "지난번에는 사람들이 자기 자신을 실제보다 더 좋게 보려는 ‘자기도취’를 다룬 2장을 읽고 있었어요.",
    lastScene:
      "깊은 자기도취에 빠진 지도자가 주변 사람들을 하나씩 잃어가는 사례를 읽던 중이었어요.",
    keyPoints: [
      "자기애는 누구에게나 있고, 그 자체로 나쁜 것은 아니다.",
      "건강한 자기애는 관심을 바깥, 곧 타인에게로 돌릴 수 있게 한다.",
      "깊은 자기도취는 관계를 조금씩 무너뜨린다.",
    ],
    concepts: [
      { term: "비이성", description: "감정이 먼저 판단하고, 이성이 뒤따라 이유를 만드는 경향." },
      { term: "공감의 방향", description: "관심이 나를 향하는지, 상대를 향하는지에 따라 달라지는 관계의 질." },
    ],
  },
];

export const assistants: Assistant[] = [
  {
    bookId: "sapiens",
    scopeNote: "143쪽까지 읽은 내용 안에서만 이야기해요. 뒷부분은 먼저 꺼내지 않아요.",
    suggestions: [
      {
        question: "농업혁명을 왜 ‘사기’라고 부를까?",
        answer: [
          "하라리가 말하는 ‘사기’는 누군가 의도적으로 속였다는 뜻이 아니에요. 사람들이 더 나은 삶을 기대하며 농사를 시작했지만, 결과적으로는 더 긴 노동, 더 단조로운 식단, 더 잦은 질병을 얻게 되었다는 뜻이에요.",
          "종(種)으로서의 사피엔스는 크게 번성했지만, 개개인의 하루는 수렵채집 시절보다 오히려 고단해졌다는 대비가 이 장의 핵심이에요.",
        ],
      },
      {
        question: "지금까지 나온 핵심 개념을 정리해줘",
        answer: [
          "1부에서는 ‘인지혁명’이 가장 중요해요. 사피엔스는 눈에 보이지 않는 것, 곧 신화나 국가, 돈 같은 허구를 함께 믿으면서 수많은 낯선 사람과 협력할 수 있게 되었어요.",
          "지금 읽고 있는 2부는 ‘농업혁명’이에요. 정착과 농경이 인구를 늘렸지만, 그 대가로 개인의 삶이 어떻게 바뀌었는지를 묻고 있어요.",
        ],
      },
      {
        question: "143쪽부터 읽기 전에 알아두면 좋은 것",
        answer: [
          "이어지는 부분에서는 ‘사치의 덫’이라는 생각이 조금 더 구체적으로 나와요. 한 번 편리함에 익숙해지면 다시 돌아가기 어렵다는 이야기예요.",
          "우리가 ‘더 편해지려고’ 받아들인 스마트폰이나 이메일을 떠올리며 읽으면 훨씬 가깝게 느껴질 거예요.",
        ],
      },
    ],
  },
  {
    bookId: "laws-of-human-nature",
    scopeNote: "82쪽까지 읽은 내용 안에서만 이야기해요.",
    suggestions: [
      {
        question: "건강한 자기애와 깊은 자기도취는 어떻게 다를까?",
        answer: [
          "그린은 자기애를 하나의 스펙트럼으로 봐요. 건강한 쪽 끝에 있는 사람은 스스로를 적당히 사랑하기 때문에 오히려 관심을 타인에게 돌릴 여유가 있어요.",
          "깊은 자기도취는 그 반대예요. 내면이 불안정할수록 끊임없이 주목과 인정을 필요로 하고, 결국 관계가 모두 자신을 비추는 거울이 되어버려요.",
        ],
      },
      {
        question: "1장 ‘비이성의 법칙’을 한 문단으로",
        answer: [
          "우리는 스스로 합리적이라고 믿지만, 대부분의 결정은 감정이 먼저 내리고 이성은 나중에 그럴듯한 이유를 붙여요. 이 사실을 인정하는 것이 오히려 더 이성적인 사람이 되는 첫걸음이라는 이야기예요.",
        ],
      },
    ],
  },
];

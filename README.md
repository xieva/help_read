# 리더

읽던 책으로 자연스럽게 다시 돌아가고, 계속 읽고 싶게 만드는 독서 공간 — 첫 번째 프로토타입입니다.
지금은 실제 AI·로그인·데이터베이스 없이 **가짜 데이터(Mock Data)** 로 화면과 흐름만 보여줍니다.

## 실행 방법

처음 한 번만 (필요한 도구 설치):

```bash
npm install
```

실행:

```bash
npm run dev
```

브라우저에서 http://localhost:3000 을 엽니다. 종료는 터미널에서 `Ctrl + C`.

> 아이폰에서 보려면: 컴퓨터와 아이폰을 같은 와이파이에 연결하고, `npm run dev` 실행 시 터미널에 표시되는
> `Network: http://192.168.x.x:3000` 주소를 아이폰 사파리에서 엽니다.

## 웹에서 보기 (GitHub Pages)

주소: **https://xieva.github.io/help_read/**

코드를 GitHub에 올리면(push) 약 1~2분 뒤 위 주소에 자동으로 반영됩니다.
배포 설정은 `.github/workflows/deploy.yml` 에 있어요. 진행 상황은 GitHub 저장소의 **Actions** 탭에서 볼 수 있습니다.

처음 한 번만 해야 하는 설정:
1. GitHub 저장소 → **Settings** → 왼쪽 메뉴 **Pages**
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: **gh-pages** / **/(root)** 선택 → **Save**

## 화면

| 주소 | 화면 |
| --- | --- |
| `/` | 오늘 — 지금 읽는 책, 오늘의 독서, 지난 내용 떠올리기(시트), 선반·쌓인 책·추천 |
| `/library` | 서재 — 검색, 필터(전체/읽는 중/읽음/읽고 싶음), 연도별 선반 |
| `/books/sapiens` | 책 상세 — 책의 방: 마지막 위치, 오늘의 구간, 지난 이야기, 메모, 독서 도우미 |
| `/books/sapiens/read` | 독서 모드 |
| `/discover` | 발견 — 내 책에서 이어지는 추천 |

## 중요한 파일

- `data/books.ts` — 서재의 책 (Mock Data). 책·메모·목차를 바꾸려면 여기.
- `data/reading.ts` — 오늘의 독서 제안, 지난 내용 요약, 독서 도우미 답변 (나중에 AI가 만들 내용).
- `data/recommendations.ts` — 추천 책과 추천 이유.
- `lib/library.ts` — 화면이 데이터를 가져가는 함수들. **Supabase·AI 연결 시 여기만 바꾸면 됩니다.**
- `app/globals.css` — 디자인 시스템 (색, 글꼴, 입체 책, 화면 전환).
- `components/book/` — 표지, 입체 책, 책등, 진행 지도.
- `app/` — 화면. 폴더 이름이 곧 주소입니다.


## 사용자 화면과 제작자 미리보기

- `/`: 사용자 홈. 처음 방문하면 빈 서재로 시작합니다.
- `/library`: 자기 책 추가·수정·삭제, 쪽수·메모, 검색·필터·좌우 페이지 이동.
- `/creator`: 공개 제작자 미리보기 도구. 예시 홈/서재/발견과 사용자 화면 전환.
- 사용자 데이터는 localStorage의 `reader.user-library.v1`, 미리보기 선택은 sessionStorage에 저장됩니다. 예시 데이터는 사용자 서재에 복사되지 않습니다.
- 관리자 인증이 아니며 로그인·서버 저장·다른 기기 동기화·실제 AI 호출은 아직 없습니다. 브라우저 데이터를 삭제하면 기록도 삭제됩니다.
- 브랜드는 `lib/brand.ts`에서 한 번에 변경합니다.
- 전체 서가 스타일 및 생성형 표지는 디자인 승인 전이므로 미적용 상태입니다.

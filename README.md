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


## 로그인 · 회원가입 · 제작자 화면

- **로그인 전**: 예시 서재 미리보기만 볼 수 있어요. 책 추가·메모·도우미·독서 모드 같은 기능은 누르면 가입 안내가 떠요.
- **회원가입/로그인** (`/login`): 이메일·이름·비밀번호(8자 이상)로 가입하면 내 서재의 모든 기능을 쓸 수 있어요.
- **제작자(어드민)**: `lib/auth.ts` 의 `ADMIN_EMAILS` 에 적힌 이메일(기본 `admin@reader.app`)로 가입하면 제작자 계정이 돼요.
  로그인하면 `/creator` 제작자 화면이 뜨고, 위쪽 전환 버튼으로 **제작자 화면 ↔ 사용자 화면**을 오갈 수 있어요.
- 계정과 서재는 **이 브라우저에만** 저장돼요 (비밀번호는 해시로 저장). 진짜 보안·다른 기기 로그인은 서버(Supabase 등) 연결 후 가능해요.
  나중에 바꿀 곳: `lib/auth.ts`(계정), `components/workspace/WorkspaceProvider.tsx`(서재 저장).

## 서재 · 책 상세 · 테마

- **서재** (편집숍 서가): 카테고리 하나 = 책장 하나, 좌우로 넘겨요. 책을 한 번 누르면 옆 책들이 비켜나며 표지 쪽으로 돌아 나오고, 한 번 더 누르면 열려요.
  `components/book/BookstoreShelf.tsx`, 스타일은 `app/bookstore.css`.
- **책 상세**: 책을 밀면 돌아가고, 누르면 종이가 끝까지 넘어가 **뒷면**이 나와요. 위로 나온 **책갈피**를 누르면 읽던 쪽이 펼쳐져요.
  책갈피 무늬(밤하늘·잔디·바다·노을·벚꽃·눈)는 책마다 고를 수 있어요. `components/book/BookViewer.tsx`, `components/book/Bookmark.tsx`.
- **앞·뒤 표지 이미지**: 책 데이터의 `coverImage`(앞), `coverBackImage`(뒤)에 이미지 주소를 넣으면 그림 대신 이미지가 보여요.
- **테마**: 설정에서 서점의 밤(기본)·종이·숲속 서재·새벽 중에 고를 수 있어요. 색은 `app/themes.css`, 목록은 `lib/theme.ts`.
- 브랜드 이름은 `lib/brand.ts` 에서 한 번에 바꿔요.

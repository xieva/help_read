# 다시, 책

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
| `/` | 오늘 (홈) — 계속 읽기, 오늘의 독서 제안 |
| `/library` | 서재 — 읽는 중 / 읽고 싶은 책 / 다 읽은 책 |
| `/books/sapiens` | 책 상세 |
| `/books/sapiens/recall` | 맥락 다시보기 |
| `/books/sapiens/read` | 계속 읽기 (독서 시작 화면) |
| `/discover` | 다음에 읽을 책 (AI 추천) |

## 중요한 파일

- `data/books.ts` — 모든 가짜 데이터 (책, 독서 제안, 맥락 요약, 추천). **문구나 책을 바꾸려면 여기를 수정하세요.**
- `lib/library.ts` — 화면이 데이터를 가져가는 함수들. 나중에 Supabase/AI를 연결할 때 이 파일을 바꿉니다.
- `app/globals.css` — 색상과 글꼴 등 디자인 기본값.
- `app/page.tsx` — 홈 화면. 다른 화면은 `app/` 아래 폴더 이름이 곧 주소입니다.
- `components/` — 책 표지, 진행률 선, 책장, 메뉴 등 여러 화면에서 함께 쓰는 조각.

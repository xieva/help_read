// 책 표지가 화면을 넘어 이어지게 해주는 감싸개
// 같은 id 의 BookMorph 가 이전 화면과 다음 화면에 모두 있으면,
// 브라우저가 표지를 원래 자리에서 새 자리로 부드럽게 옮겨줍니다. (View Transitions)
// 주의: 한 화면 안에서 같은 id 는 한 번만 써야 해요.

import { ViewTransition } from "react";

export default function BookMorph({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <ViewTransition name={`book-${id}`} share="book-morph" default="none">
      {children}
    </ViewTransition>
  );
}

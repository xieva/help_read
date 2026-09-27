// template.tsx는 화면이 바뀔 때마다 새로 그려집니다.
// 그래서 여기에 넣은 부드러운 등장 효과가 페이지 이동마다 실행돼요.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}

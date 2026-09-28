import { matchCatalogBook } from "@/lib/catalog";

export default function CatalogDetails({ book }: { book: { title: string; author: string } }) {
  const entry = matchCatalogBook(book);
  if (!entry) return null;
  return <section className="catalog-details" aria-label="작품 소개와 출처">
    <h2>이 책에 관하여</h2>
    <p>{entry.summary}</p>
    <p className="catalog-source-note">출판사·저자 소개를 바탕으로 정리한 요약 · 결말은 담지 않았어요.</p>
    <h3>읽으며 생각해 볼 질문</h3>
    <p>{entry.readingQuestion}</p>
    {entry.reviews.length > 0 && <><h3>서평에서 짚은 점</h3>
      {entry.reviews.map((review) => <div key={review.outlet} className="mb-4"><p>{review.summary}</p><p className="catalog-source-note">{review.outlet} · 출판사 페이지에 수록된 서평의 요약</p></div>)}
      <p className="catalog-source-note">출판사가 선정한 서평이에요. 독자 리뷰나 전체 평점을 뜻하지 않아요.</p>
    </>}
    <details className="mt-6"><summary className="cursor-pointer text-sm text-ink-2">참고한 자료 · {entry.sources.length}곳</summary>
      <ul className="catalog-source-list mt-4">{entry.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a><span className="ml-2 text-ink-3">{source.accessedAt} 확인</span></li>)}</ul>
    </details>
    <p className="catalog-source-note">표지는 리더에서 만든 아트 커버예요. 실제 출판본의 표지와 다릅니다.</p>
  </section>;
}

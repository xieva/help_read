import { coverArtPath, type CatalogBook } from "@/lib/catalog";

/** One generated jacket, CSS-windowed into its front/right and back/left halves. */
export default function CatalogCoverArt({ book, back = false }: { book: CatalogBook; back?: boolean }) {
  return <div className={`catalog-cover-art ${back ? "is-back" : ""}`} style={{ color: book.artwork.ink }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={coverArtPath(book)} alt="" loading="lazy" decoding="async" className="catalog-jacket" />
    <div className="catalog-cover-type">
      <span className="catalog-cover-kicker">{back ? "READING NOTES" : "READER ART EDITION"}</span>
      {back ? <><p className="catalog-back-hook">{book.hook}</p><p className="catalog-back-copy">{book.summary}</p><span className="catalog-cover-author">{book.author} · 리더 아트 커버</span></> : <><p className="catalog-cover-title">{book.title}</p><span className="catalog-cover-author">{book.author}</span></>}
    </div>
  </div>;
}

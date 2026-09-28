import catalog from "@/data/catalog.json";

export type CatalogBook = (typeof catalog.books)[number];
export const catalogBooks: CatalogBook[] = catalog.books;
export const catalogVersion = catalog.version;
export const catalogUpdatedAt = catalog.updatedAt;
export const normalizeBookText = (value: string) => value.normalize("NFKC").toLocaleLowerCase().replace(/[\s\p{P}\p{S}]+/gu, "");
export const getCatalogBook = (id: string) => catalogBooks.find((book) => book.id === id);

// Work identity, not an edition/ISBN match. Never attach another author's book by title alone.
export function matchCatalogBook(book: { title: string; author: string }): CatalogBook | undefined {
  const title = normalizeBookText(book.title);
  const author = normalizeBookText(book.author);
  if (!title || !author) return undefined;
  return catalogBooks.find((entry) =>
    [entry.title, entry.originalTitle].some((name) => normalizeBookText(name) === title) &&
    [entry.author, ...entry.authorAliases].some((name) => normalizeBookText(name) === author),
  );
}

export function searchCatalog(query: string): CatalogBook[] {
  const terms = query.trim().split(/\s+/).map(normalizeBookText).filter(Boolean);
  return catalogBooks.filter((book) => {
    const text = normalizeBookText([book.title, book.originalTitle, book.author, ...book.authorAliases, book.genre, ...book.tags].join(" "));
    return terms.every((term) => text.includes(term));
  });
}

export function coverArtPath(book: CatalogBook) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${book.artwork.path}`;
}

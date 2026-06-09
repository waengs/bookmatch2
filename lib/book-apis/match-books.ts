import { searchGoogleBooks } from './google-books';
import { searchHardcover, searchHardcoverByGenre } from './hardcover';
import { searchOpenLibrary, searchOpenLibraryBySubject } from './openlibrary';
import { mergeRawBooks, rawToBook, type RawBook } from './normalize';
import { getFallbackBooks } from '../fallback-books';
import { readerTypes } from '../reader-types';
import type { Book, ReaderTypeId } from '../types';

const cache = new Map<string, { books: Book[]; ts: number }>();
const CACHE_TTL = 1000 * 60 * 30;

function scoreBook(raw: RawBook, typeId: ReaderTypeId): number {
  const type = readerTypes[typeId];
  const haystack = [
    ...raw.tags,
    raw.title,
    raw.description ?? '',
  ].join(' ').toLowerCase();

  let score = 40;

  for (const genre of type.searchGenres) {
    if (haystack.includes(genre.toLowerCase())) score += 12;
  }
  for (const mood of type.searchMoods) {
    if (haystack.includes(mood.toLowerCase())) score += 8;
  }
  for (const tag of type.tags) {
    if (haystack.includes(tag.toLowerCase())) score += 6;
  }
  if (raw.rating && raw.rating >= 4) score += 5;
  if (raw.coverUrl) score += 3;
  if (raw.source?.includes('hardcover')) score += 4;

  return Math.min(score, 99);
}

async function fetchFromApis(typeId: ReaderTypeId): Promise<RawBook[]> {
  const type = readerTypes[typeId];
  const query = type.searchQueries[0];
  const genre = type.searchGenres[0];

  const [hardcover, hardcoverGenre, openLib, openLibSubject, google] = await Promise.all([
    searchHardcover(query, 8),
    searchHardcoverByGenre(genre, 6),
    searchOpenLibrary(query, 8),
    searchOpenLibraryBySubject(genre, 6),
    searchGoogleBooks(`${query} ${genre}`, 6),
  ]);

  return mergeRawBooks([
    ...hardcover,
    ...hardcoverGenre,
    ...openLib,
    ...openLibSubject,
    ...google,
  ]);
}

export async function matchBooksForReaderType(
  typeId: ReaderTypeId,
  limit = 20
): Promise<{ books: Book[]; source: 'live' | 'fallback' }> {
  const cacheKey = `${typeId}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { books: cached.books, source: 'live' };
  }

  let rawBooks: RawBook[] = [];

  try {
    rawBooks = await fetchFromApis(typeId);
  } catch {
    rawBooks = [];
  }

  if (rawBooks.length < 3) {
    const fallback = getFallbackBooks(typeId).slice(0, limit);
    return { books: fallback, source: 'fallback' };
  }

  const scored = rawBooks
    .map((raw, i) => ({
      raw,
      score: scoreBook(raw, typeId),
      i,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const books = scored.map(({ raw, score, i }, rank) =>
    rawToBook(raw, Math.max(83, Math.min(99, score - rank)), i)
  );

  cache.set(cacheKey, { books, ts: Date.now() });
  return { books, source: 'live' };
}

import { genreHaystackTerms, resolveGenreIds } from '../search-genres';
import { searchGoogleBooks } from './google-books';
import { searchHardcover } from './hardcover';
import { searchOpenLibrary, searchOpenLibraryBySubject } from './openlibrary';
import { mergeRawBooks, rawToBook, type RawBook } from './normalize';
import type { Book } from '../types';

const cache = new Map<string, { books: Book[]; ts: number }>();
const CACHE_TTL = 1000 * 60 * 15;

function cacheKey(query: string, genres: string[], limit: number): string {
  return `${query.toLowerCase()}::${genres.sort().join(',')}::${limit}`;
}

function bookHaystack(raw: RawBook): string {
  return [...raw.tags, raw.title, raw.author, raw.description ?? '']
    .join(' ')
    .toLowerCase();
}

function matchesGenres(raw: RawBook, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const haystack = bookHaystack(raw);
  return terms.some((term) => haystack.includes(term));
}

function scoreSearchBook(raw: RawBook, query: string, genreTerms: string[]): number {
  const haystack = bookHaystack(raw);
  let score = 45;

  const q = query.trim().toLowerCase();
  if (q) {
    if (raw.title.toLowerCase().includes(q)) score += 35;
    if (raw.author.toLowerCase().includes(q)) score += 15;
    if (haystack.includes(q)) score += 10;
  }

  for (const term of genreTerms) {
    if (haystack.includes(term)) score += 8;
  }

  if (raw.coverUrl) score += 4;
  if (raw.rating && raw.rating >= 4) score += 4;
  if (raw.source?.includes('hardcover')) score += 3;

  return Math.min(99, score);
}

async function fetchSearchResults(query: string, genreIds: string[]): Promise<RawBook[]> {
  const genres = resolveGenreIds(genreIds);
  const tasks: Promise<RawBook[]>[] = [];

  const trimmed = query.trim();

  if (trimmed) {
    tasks.push(searchGoogleBooks(trimmed, 14));
    tasks.push(searchOpenLibrary(trimmed, 14));
    tasks.push(searchHardcover(trimmed, 10));
  }

  for (const genre of genres) {
    for (const term of genre.terms.slice(0, 2)) {
      tasks.push(searchOpenLibraryBySubject(term, 6));
      if (!trimmed) {
        tasks.push(searchGoogleBooks(`${term} children's book`, 6));
        tasks.push(searchOpenLibrary(term, 6));
      }
    }
  }

  if (tasks.length === 0) return [];

  const batches = await Promise.all(tasks);
  return mergeRawBooks(batches.flat());
}

export async function searchBooks(options: {
  query?: string;
  genres?: string[];
  limit?: number;
}): Promise<{ books: Book[]; source: 'live' | 'empty' }> {
  const query = (options.query ?? '').trim();
  const genreIds = options.genres ?? [];
  const limit = Math.min(options.limit ?? 20, 24);

  if (!query && genreIds.length === 0) {
    return { books: [], source: 'empty' };
  }

  const key = cacheKey(query, genreIds, limit);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { books: cached.books, source: 'live' };
  }

  const genreTerms = genreHaystackTerms(resolveGenreIds(genreIds));
  let rawBooks = await fetchSearchResults(query, genreIds);

  if (genreIds.length > 0) {
    rawBooks = rawBooks.filter((raw) => matchesGenres(raw, genreTerms));
  }

  if (rawBooks.length === 0) {
    return { books: [], source: 'empty' };
  }

  const scored = rawBooks
    .map((raw, i) => ({
      raw,
      score: scoreSearchBook(raw, query, genreTerms),
      i,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const books = scored.map(({ raw, score, i }, rank) =>
    rawToBook(raw, Math.max(70, Math.min(99, score - rank)), i)
  );

  cache.set(key, { books, ts: Date.now() });
  return { books, source: 'live' };
}

import type { Book } from '../types';
import { pickEmoji, pickGradient } from '../fallback-books';

export interface RawBook {
  id: string;
  title: string;
  author: string;
  tags: string[];
  coverUrl?: string;
  rating?: number;
  reviews?: string;
  description?: string;
  source: string;
  externalUrl?: string;
  price?: number;
  currency?: string;
}

function isGoogleBooksUrl(url?: string): boolean {
  return !!url && url.includes('books.google.com');
}

function pickExternalUrl(a?: string, b?: string): string | undefined {
  if (isGoogleBooksUrl(a)) return a;
  if (isGoogleBooksUrl(b)) return b;
  return a || b;
}

export function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function dedupeKey(title: string, author: string): string {
  return `${normalizeTitle(title)}::${normalizeTitle(author)}`;
}

export function rawToBook(raw: RawBook, match: number, index: number): Book {
  return {
    id: raw.id,
    title: raw.title,
    author: raw.author,
    match,
    rating: raw.rating,
    reviews: raw.reviews,
    tags: raw.tags.slice(0, 3),
    coverUrl: raw.coverUrl,
    emoji: pickEmoji(index),
    gradient: pickGradient(index),
    description: raw.description,
    source: raw.source,
    externalUrl: raw.externalUrl,
    price: raw.price,
    currency: raw.currency,
  };
}

export function mergeRawBooks(books: RawBook[]): RawBook[] {
  const seen = new Map<string, RawBook>();

  for (const book of books) {
    const key = dedupeKey(book.title, book.author);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, book);
      continue;
    }
    seen.set(key, {
      ...existing,
      tags: [...new Set([...existing.tags, ...book.tags])],
      coverUrl: existing.coverUrl || book.coverUrl,
      rating: existing.rating ?? book.rating,
      reviews: existing.reviews ?? book.reviews,
      description: existing.description || book.description,
      source: `${existing.source}+${book.source}`,
      externalUrl: pickExternalUrl(existing.externalUrl, book.externalUrl),
      price: existing.price ?? book.price,
      currency: existing.currency ?? book.currency,
    });
  }

  return Array.from(seen.values());
}

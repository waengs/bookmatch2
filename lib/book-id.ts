import { dedupeKey } from '@/lib/book-apis/normalize';

/** Stable Firestore document id for a saved book */
export function collectionDocId(title: string, author: string): string {
  const key = dedupeKey(title, author);
  const safe = key.replace(/[^a-z0-9_-]/g, '_').slice(0, 120);
  return safe || 'book';
}

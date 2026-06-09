import type { Book } from '@/lib/types';
import { collectionDocId } from '@/lib/book-id';

export const QUEST_BOOK_GOAL = 10;
/** How many matched books to load for quest fill / recommendations */
export const QUEST_RECOMMENDATION_POOL = 20;
export const MIN_REVIEW_WORDS = 100;

export interface QuestReview {
  rating: number;
  text: string;
  wordCount: number;
  submittedAt: string;
}

export interface QuestBookEntry {
  docId: string;
  id: string;
  title: string;
  author: string;
  match: number;
  tags: string[];
  coverUrl?: string;
  emoji: string;
  gradient: string;
  addedAt: string;
  review?: QuestReview;
}

export interface ReadingQuestData {
  books: QuestBookEntry[];
  status: 'active' | 'completed';
  completedAt?: string;
  updatedAt: string;
}

export function countReviewWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isValidReview(rating: number, text: string): boolean {
  return rating >= 1 && rating <= 5 && countReviewWords(text) >= MIN_REVIEW_WORDS;
}

export function bookToQuestEntry(book: Book): QuestBookEntry {
  return {
    docId: collectionDocId(book.title, book.author),
    id: book.id,
    title: book.title,
    author: book.author,
    match: book.match,
    tags: book.tags.slice(0, 3),
    coverUrl: book.coverUrl,
    emoji: book.emoji,
    gradient: book.gradient,
    addedAt: new Date().toISOString(),
  };
}

export function isQuestBookReviewed(entry: QuestBookEntry): boolean {
  return !!entry.review && entry.review.wordCount >= MIN_REVIEW_WORDS;
}

export function isQuestComplete(quest: ReadingQuestData): boolean {
  return (
    quest.books.length === QUEST_BOOK_GOAL &&
    quest.books.every(isQuestBookReviewed)
  );
}

export function emptyQuest(): ReadingQuestData {
  return {
    books: [],
    status: 'active',
    updatedAt: new Date().toISOString(),
  };
}

export function mergeQuestBooks(
  existing: QuestBookEntry[],
  incoming: Book[]
): QuestBookEntry[] {
  const seen = new Set(existing.map((b) => b.docId));
  const merged = [...existing];

  for (const book of incoming) {
    if (merged.length >= QUEST_BOOK_GOAL) break;
    const entry = bookToQuestEntry(book);
    if (seen.has(entry.docId)) continue;
    seen.add(entry.docId);
    merged.push(entry);
  }

  return merged;
}

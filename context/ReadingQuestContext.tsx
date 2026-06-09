'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useJourney } from '@/context/JourneyContext';
import { useBookMatch } from '@/context/BookMatchContext';
import type { Book } from '@/lib/types';
import { collectionDocId } from '@/lib/book-id';
import { getFallbackBooks } from '@/lib/fallback-books';
import { getReaderType } from '@/lib/reader-types';
import {
  isQuestBookReviewed,
  mergeQuestBooks,
  QUEST_BOOK_GOAL,
  QUEST_RECOMMENDATION_POOL,
  type ReadingQuestData,
} from '@/lib/reading-quest';

function uniqueBooks(books: Book[], exclude: Set<string>, max: number): Book[] {
  const out: Book[] = [];
  const seen = new Set(exclude);
  for (const book of books) {
    const id = collectionDocId(book.title, book.author);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(book);
    if (out.length >= max) break;
  }
  return out;
}

interface ReadingQuestContextValue {
  quest: ReadingQuestData | null;
  loading: boolean;
  isSignedIn: boolean;
  goal: number;
  booksCount: number;
  reviewedCount: number;
  slotsLeft: number;
  isComplete: boolean;
  isInQuest: (book: Pick<Book, 'title' | 'author'>) => boolean;
  addBook: (book: Book) => Promise<boolean>;
  addBooks: (books: Book[]) => Promise<boolean>;
  addAllRecommendations: (books: Book[]) => Promise<boolean>;
  fillFromRecommendations: (books: Book[]) => Promise<boolean>;
  removeBook: (book: Pick<Book, 'title' | 'author'>) => Promise<void>;
  submitReview: (book: Book, rating: number, text: string) => Promise<boolean>;
  refreshQuest: () => Promise<void>;
}

const ReadingQuestContext = createContext<ReadingQuestContextValue | null>(null);

export function ReadingQuestProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { onReadingQuestCompleted, onBookReviewed } = useJourney();
  const { readerTypeId } = useBookMatch();
  const [quest, setQuest] = useState<ReadingQuestData | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignedIn = !!session?.user;

  const refreshQuest = useCallback(async () => {
    if (!session?.user) {
      setQuest(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/user/reading-quest');
      if (res.ok) {
        const data = await res.json();
        setQuest(data.quest);
      }
    } catch {
      /* keep state */
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === 'loading') return;
    refreshQuest();
  }, [status, refreshQuest]);

  const questKeys = useMemo(
    () => new Set(quest?.books.map((b) => b.docId) ?? []),
    [quest?.books]
  );

  const isInQuest = useCallback(
    (book: Pick<Book, 'title' | 'author'>) =>
      questKeys.has(collectionDocId(book.title, book.author)),
    [questKeys]
  );

  const requireAuth = useCallback(() => {
    if (session?.user) return true;
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    return false;
  }, [session?.user, router]);

  const postQuest = useCallback(async (payload: object): Promise<ReadingQuestData | null> => {
    const res = await fetch('/api/user/reading-quest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setQuest(data.quest);
    return data.quest;
  }, []);

  const addBooks = useCallback(
    async (books: Book[]): Promise<boolean> => {
      if (!requireAuth()) return false;
      const result = await postQuest({ books });
      return !!result;
    },
    [requireAuth, postQuest]
  );

  const addBook = useCallback(
    async (book: Book): Promise<boolean> => addBooks([book]),
    [addBooks]
  );

  const gatherFillCandidates = useCallback(
    async (seed: Book[], existing: Set<string>, needed: number): Promise<Book[]> => {
      let pool = uniqueBooks(seed, existing, needed);
      if (pool.length >= needed) return pool;

      if (readerTypeId) {
        try {
          const type = getReaderType(readerTypeId);
          const params = new URLSearchParams({ limit: String(QUEST_RECOMMENDATION_POOL) });
          if (type.searchGenres.length > 0) {
            params.set('genres', type.searchGenres.slice(0, 3).join(','));
          } else if (type.searchQueries[0]) {
            params.set('q', type.searchQueries[0]);
          }
          const res = await fetch(`/api/books/search?${params}`);
          if (res.ok) {
            const data = await res.json();
            const exclude = new Set([...existing, ...pool.map((b) => collectionDocId(b.title, b.author))]);
            pool = [...pool, ...uniqueBooks(data.books ?? [], exclude, needed - pool.length)];
          }
        } catch {
          /* keep partial pool */
        }
      }

      if (pool.length < needed && readerTypeId) {
        const exclude = new Set([...existing, ...pool.map((b) => collectionDocId(b.title, b.author))]);
        pool = [...pool, ...uniqueBooks(getFallbackBooks(readerTypeId), exclude, needed - pool.length)];
      }

      return pool.slice(0, needed);
    },
    [readerTypeId]
  );

  const addAllRecommendations = useCallback(
    async (books: Book[]): Promise<boolean> => {
      if (!requireAuth()) return false;
      const current = quest?.books ?? [];
      const slotsLeft = QUEST_BOOK_GOAL - current.length;
      if (slotsLeft <= 0) return false;

      const existing = new Set(current.map((b) => b.docId));
      const candidates = await gatherFillCandidates(books, existing, slotsLeft);
      return addBooks(candidates);
    },
    [requireAuth, quest, addBooks, gatherFillCandidates]
  );

  const fillFromRecommendations = useCallback(
    async (books: Book[]): Promise<boolean> => {
      if (!requireAuth()) return false;
      const current = quest?.books ?? [];
      const slotsLeft = QUEST_BOOK_GOAL - current.length;
      if (slotsLeft <= 0) return false;

      const existing = new Set(current.map((b) => b.docId));
      const candidates = await gatherFillCandidates(books, existing, slotsLeft);
      if (candidates.length === 0) return false;

      const toAdd = mergeQuestBooks(current, candidates).slice(current.length);
      if (toAdd.length === 0) return false;

      const asBooks: Book[] = toAdd.map((e) => ({
        id: e.id,
        title: e.title,
        author: e.author,
        match: e.match,
        tags: e.tags,
        coverUrl: e.coverUrl,
        emoji: e.emoji,
        gradient: e.gradient,
      }));

      return addBooks(asBooks);
    },
    [requireAuth, quest, addBooks, gatherFillCandidates]
  );

  const removeBook = useCallback(
    async (book: Pick<Book, 'title' | 'author'>) => {
      if (!session?.user) return;
      await postQuest({ action: 'remove', book });
    },
    [session?.user, postQuest]
  );

  const submitReview = useCallback(
    async (book: Book, rating: number, text: string): Promise<boolean> => {
      if (!session?.user) return false;
      const docId = collectionDocId(book.title, book.author);
      const alreadyReviewed = quest?.books.some(
        (entry) => entry.docId === docId && isQuestBookReviewed(entry)
      );
      const result = await postQuest({
        action: 'review',
        book,
        rating,
        text,
      });
      if (result && !alreadyReviewed) {
        onBookReviewed();
      }
      return !!result;
    },
    [session?.user, quest?.books, postQuest, onBookReviewed]
  );

  const booksCount = quest?.books.length ?? 0;
  const reviewedCount = quest?.books.filter(isQuestBookReviewed).length ?? 0;
  const slotsLeft = Math.max(0, QUEST_BOOK_GOAL - booksCount);
  const isComplete = quest?.status === 'completed';

  useEffect(() => {
    if (isComplete) onReadingQuestCompleted();
  }, [isComplete, onReadingQuestCompleted]);

  return (
    <ReadingQuestContext.Provider
      value={{
        quest,
        loading,
        isSignedIn,
        goal: QUEST_BOOK_GOAL,
        booksCount,
        reviewedCount,
        slotsLeft,
        isComplete,
        isInQuest,
        addBook,
        addBooks,
        addAllRecommendations,
        fillFromRecommendations,
        removeBook,
        submitReview,
        refreshQuest,
      }}
    >
      {children}
    </ReadingQuestContext.Provider>
  );
}

export function useReadingQuest() {
  const ctx = useContext(ReadingQuestContext);
  if (!ctx) throw new Error('useReadingQuest must be used within ReadingQuestProvider');
  return ctx;
}

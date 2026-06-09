'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Book, ReaderType, ReaderTypeId } from '@/lib/types';
import { getReaderType } from '@/lib/reader-types';
import { getFallbackBooks } from '@/lib/fallback-books';
import { QUEST_RECOMMENDATION_POOL } from '@/lib/reading-quest';

function isValidReaderTypeId(id: string | null | undefined): id is ReaderTypeId {
  if (!id) return false;
  return getReaderType(id).id === id;
}

interface BookMatchContextValue {
  readerType: ReaderType | null;
  readerTypeId: ReaderTypeId | null;
  books: Book[];
  booksLoading: boolean;
  booksSource: 'live' | 'fallback' | null;
  hydrated: boolean;
  isSignedIn: boolean;
  setReaderTypeId: (id: ReaderTypeId) => Promise<void>;
  refreshBooks: (id: ReaderTypeId) => Promise<void>;
  openQuiz: () => void;
  closeQuiz: () => void;
  quizOpen: boolean;
}

const BookMatchContext = createContext<BookMatchContextValue | null>(null);

async function fetchBooks(typeId: ReaderTypeId): Promise<{
  books: Book[];
  source: 'live' | 'fallback';
}> {
  try {
    const res = await fetch(`/api/books/match?type=${typeId}&limit=${QUEST_RECOMMENDATION_POOL}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    return { books: data.books, source: data.source };
  } catch {
    return { books: getFallbackBooks(typeId), source: 'fallback' };
  }
}

export function BookMatchProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [readerTypeId, setReaderTypeIdState] = useState<ReaderTypeId | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [booksSource, setBooksSource] = useState<'live' | 'fallback' | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const isSignedIn = !!session?.user;

  const refreshBooks = useCallback(async (id: ReaderTypeId) => {
    setBooksLoading(true);
    const { books: fetched, source } = await fetchBooks(id);
    setBooks(fetched);
    setBooksSource(source);
    setBooksLoading(false);
  }, []);

  const setReaderTypeId = useCallback(async (id: ReaderTypeId) => {
    if (!session?.user) return;

    setReaderTypeIdState(id);
    await refreshBooks(id);

    await fetch('/api/user/reader-type', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerTypeId: id }),
    });
    await update({ readerTypeId: id });
  }, [refreshBooks, session?.user, update]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      setReaderTypeIdState(null);
      setBooks([]);
      setBooksSource(null);
      setHydrated(true);
      return;
    }

    const sessionType = session.user.readerTypeId;
    const resolved = isValidReaderTypeId(sessionType) ? sessionType : null;

    setReaderTypeIdState(resolved);

    if (resolved) {
      refreshBooks(resolved);
    } else {
      setBooks([]);
      setBooksSource(null);
    }

    setHydrated(true);
  }, [status, session?.user, session?.user?.readerTypeId, refreshBooks]);

  useEffect(() => {
    if (status !== 'loading' && !session?.user && quizOpen) {
      setQuizOpen(false);
    }
  }, [status, session?.user, quizOpen]);

  const openQuiz = useCallback(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/?quiz=1')}`);
      return;
    }
    setQuizOpen(true);
  }, [session?.user, status, router]);

  const closeQuiz = useCallback(() => setQuizOpen(false), []);

  return (
    <BookMatchContext.Provider
      value={{
        readerType: readerTypeId ? getReaderType(readerTypeId) : null,
        readerTypeId,
        books,
        booksLoading,
        booksSource,
        hydrated,
        isSignedIn,
        setReaderTypeId,
        refreshBooks,
        openQuiz,
        closeQuiz,
        quizOpen,
      }}
    >
      {children}
    </BookMatchContext.Provider>
  );
}

export function useBookMatch() {
  const ctx = useContext(BookMatchContext);
  if (!ctx) throw new Error('useBookMatch must be used within BookMatchProvider');
  return ctx;
}

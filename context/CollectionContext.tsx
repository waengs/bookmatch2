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
import type { Book } from '@/lib/types';
import type { SavedBook } from '@/lib/firebase/collection';
import type { QuestReview } from '@/lib/reading-quest';
import { collectionDocId } from '@/lib/book-id';
import { useJourney } from '@/context/JourneyContext';

interface CollectionContextValue {
  savedBooks: SavedBook[];
  loading: boolean;
  isSignedIn: boolean;
  isSaved: (book: Pick<Book, 'title' | 'author'>) => boolean;
  getReview: (book: Pick<Book, 'title' | 'author'>) => QuestReview | undefined;
  toggleSave: (book: Book) => Promise<void>;
  submitReview: (book: Book, rating: number, text: string) => Promise<boolean>;
  savingId: string | null;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { onBookReviewed, onBookSavedToCollection } = useJourney();
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const isSignedIn = !!session?.user;

  const savedKeys = useMemo(
    () => new Set(savedBooks.map((b) => collectionDocId(b.title, b.author))),
    [savedBooks]
  );

  const isSaved = useCallback(
    (book: Pick<Book, 'title' | 'author'>) =>
      savedKeys.has(collectionDocId(book.title, book.author)),
    [savedKeys]
  );

  const getReview = useCallback(
    (book: Pick<Book, 'title' | 'author'>) => {
      const key = collectionDocId(book.title, book.author);
      return savedBooks.find((b) => collectionDocId(b.title, b.author) === key)?.review;
    },
    [savedBooks]
  );

  const loadCollection = useCallback(async () => {
    if (!session?.user) {
      setSavedBooks([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/collection');
      if (res.ok) {
        const data = await res.json();
        setSavedBooks(data.books ?? []);
      }
    } catch {
      /* keep existing state */
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useEffect(() => {
    if (status === 'loading') return;
    loadCollection();
  }, [status, loadCollection]);

  const toggleSave = useCallback(
    async (book: Book) => {
      if (status === 'loading') return;

      if (!session?.user) {
        const returnUrl = typeof window !== 'undefined'
          ? window.location.pathname + window.location.search
          : '/';
        router.push(`/login?callbackUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      const key = collectionDocId(book.title, book.author);
      const alreadySaved = savedKeys.has(key);
      setSavingId(key);

      try {
        if (alreadySaved) {
          const params = new URLSearchParams({
            title: book.title,
            author: book.author,
          });
          const res = await fetch(`/api/user/collection?${params}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('remove failed');
          setSavedBooks((prev) =>
            prev.filter((b) => collectionDocId(b.title, b.author) !== key)
          );
        } else {
          const res = await fetch('/api/user/collection', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
          });
          if (!res.ok) throw new Error('save failed');
          const data = await res.json();
          setSavedBooks((prev) => {
            const without = prev.filter((b) => collectionDocId(b.title, b.author) !== key);
            return [data.book, ...without];
          });
          onBookSavedToCollection();
        }
      } catch {
        /* could toast error */
      } finally {
        setSavingId(null);
      }
    },
    [session?.user, status, savedKeys, router, onBookSavedToCollection]
  );

  const submitReview = useCallback(
    async (book: Book, rating: number, text: string): Promise<boolean> => {
      if (!session?.user) return false;

      const key = collectionDocId(book.title, book.author);
      const hadReview = !!getReview(book);

      try {
        const res = await fetch('/api/user/collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'review', book, rating, text }),
        });
        if (!res.ok) return false;

        const data = await res.json();
        const updated = data.book as SavedBook;
        setSavedBooks((prev) =>
          prev.map((b) => (collectionDocId(b.title, b.author) === key ? updated : b))
        );

        if (!hadReview) onBookReviewed();
        return true;
      } catch {
        return false;
      }
    },
    [session?.user, getReview, onBookReviewed]
  );

  return (
    <CollectionContext.Provider
      value={{
        savedBooks,
        loading,
        isSignedIn,
        isSaved,
        getReview,
        toggleSave,
        submitReview,
        savingId,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider');
  return ctx;
}

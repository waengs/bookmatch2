'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCollection } from '@/context/CollectionContext';
import { useReadingQuest } from '@/context/ReadingQuestContext';
import CollectionBookCard from '@/components/CollectionBookCard';
import QuestReviewModal from '@/components/QuestReviewModal';
import BookReviewViewModal from '@/components/BookReviewViewModal';
import type { Book } from '@/lib/types';
import type { QuestReview } from '@/lib/reading-quest';
import {
  bookKey,
  calculateSelectedTotals,
  formatPrice,
  hasPrice,
} from '@/lib/price';

export default function MyCollection() {
  const { savedBooks, loading, isSignedIn, submitReview } = useCollection();
  const { refreshQuest } = useReadingQuest();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [reviewBook, setReviewBook] = useState<Book | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [readBook, setReadBook] = useState<Book | null>(null);
  const [readReview, setReadReview] = useState<QuestReview | null>(null);
  const [readOpen, setReadOpen] = useState(false);

  const pricedBooks = useMemo(
    () => savedBooks.filter(hasPrice),
    [savedBooks]
  );

  const totals = useMemo(
    () => calculateSelectedTotals(savedBooks, selectedKeys),
    [savedBooks, selectedKeys]
  );

  const currencyEntries = Object.entries(totals.byCurrency);

  function toggleBook(key: string) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllPriced() {
    setSelectedKeys(new Set(pricedBooks.map(bookKey)));
  }

  function selectAll() {
    setSelectedKeys(new Set(savedBooks.map(bookKey)));
  }

  function clearSelection() {
    setSelectedKeys(new Set());
  }

  function openReview(book: Book) {
    setReviewBook(book);
    setReviewOpen(true);
  }

  function openReadReview(book: Book) {
    const saved = savedBooks.find(
      (b) => b.title === book.title && b.author === book.author
    );
    if (!saved?.review) return;
    setReadBook(book);
    setReadReview(saved.review);
    setReadOpen(true);
  }

  function handleEditFromRead() {
    if (!readBook) return;
    setReadOpen(false);
    openReview(readBook);
  }

  async function handleSubmitReview(book: Book, rating: number, text: string) {
    const ok = await submitReview(book, rating, text);
    if (ok) await refreshQuest();
    return ok;
  }

  const reviewInitial = reviewBook
    ? savedBooks.find(
        (b) => b.title === reviewBook.title && b.author === reviewBook.author
      )?.review
    : undefined;

  if (!isSignedIn) {
    return (
      <section className="my-collection my-collection--guest">
        <h2 className="badges-heading">📚 My Collection</h2>
        <p className="my-collection-guest-text">
          Sign in to save books from search results and recommendations to your personal collection.
        </p>
        <Link href="/login" className="cta-btn cta-btn--primary my-collection-signin">
          Sign in to save books
        </Link>
      </section>
    );
  }

  return (
    <section className="my-collection" id="section-collection">
      <div className="my-collection-header">
        <h2 className="badges-heading">📚 My Collection</h2>
        <span className="my-collection-count">
          {savedBooks.length} book{savedBooks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="shelf-loading">Loading your collection…</div>
      ) : savedBooks.length === 0 ? (
        <div className="my-collection-empty">
          <p>No saved books yet. Tap the bookmark on any book in Explore to add it here!</p>
        </div>
      ) : (
        <>
          <div className="collection-calculator">
            <div className="collection-calculator-toolbar">
              <p className="collection-calculator-label">Calculate total for selected books</p>
              <div className="collection-calculator-actions">
                <button type="button" className="collection-calc-btn" onClick={selectAllPriced}>
                  Select priced
                </button>
                <button type="button" className="collection-calc-btn" onClick={selectAll}>
                  Select all
                </button>
                <button
                  type="button"
                  className="collection-calc-btn"
                  onClick={clearSelection}
                  disabled={selectedKeys.size === 0}
                >
                  Clear
                </button>
              </div>
            </div>

            {selectedKeys.size > 0 && (
              <div className="collection-total-panel">
                <div className="collection-total-main">
                  <span className="collection-total-label">
                    {totals.selectedCount} selected
                    {totals.pricedCount > 0 && ` · ${totals.pricedCount} with prices`}
                  </span>
                  <div className="collection-total-amounts">
                    {currencyEntries.length === 0 ? (
                      <span className="collection-total-none">No prices for selected books</span>
                    ) : (
                      currencyEntries.map(([currency, amount]) => (
                        <span key={currency} className="collection-total-amount">
                          {formatPrice(amount, currency)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
                {totals.unpricedCount > 0 && (
                  <p className="collection-total-note">
                    {totals.unpricedCount} selected book{totals.unpricedCount !== 1 ? 's' : ''}{' '}
                    {totals.unpricedCount !== 1 ? 'don\'t' : 'doesn\'t'} have a listed price yet.
                  </p>
                )}
              </div>
            )}

            {pricedBooks.length === 0 && (
              <p className="collection-price-hint">
                We&apos;re looking up prices from Google Books — check back in a moment, or add books found via search.
              </p>
            )}
          </div>

          <div className="collection-book-list">
            {savedBooks.map((book) => {
              const key = bookKey(book);
              return (
                <CollectionBookCard
                  key={key}
                  book={book}
                  selected={selectedKeys.has(key)}
                  onToggleSelect={() => toggleBook(key)}
                  onWriteReview={() => openReview(book)}
                  onReadReview={() => openReadReview(book)}
                />
              );
            })}
          </div>
        </>
      )}
      <QuestReviewModal
        book={reviewBook}
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setReviewBook(null);
        }}
        onSubmit={handleSubmitReview}
        initialRating={reviewInitial?.rating ?? 0}
        initialText={reviewInitial?.text ?? ''}
      />
      <BookReviewViewModal
        title={readBook?.title ?? ''}
        author={readBook?.author ?? ''}
        review={readReview}
        open={readOpen}
        onClose={() => {
          setReadOpen(false);
          setReadBook(null);
          setReadReview(null);
        }}
        onEdit={readBook ? handleEditFromRead : undefined}
      />
    </section>
  );
}

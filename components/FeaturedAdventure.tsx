'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Book } from '@/lib/types';
import { openBookExternalUrl } from '@/lib/book-link';
import SaveBookButton from '@/components/SaveBookButton';
import AddToQuestButton from '@/components/AddToQuestButton';

interface FeaturedAdventureProps {
  books: Book[];
  totalCount?: number;
  loading?: boolean;
  onViewAll: () => void;
}

const PICK_ROW_HEIGHT = 52;
const PICK_GAP = 8;
const VIEW_MORE_ROW_HEIGHT = 44;

function BookCover({
  book,
  className = '',
  blurred = false,
}: {
  book: Book;
  className?: string;
  blurred?: boolean;
}) {
  return (
    <div
      className={`featured-adventure-cover${className ? ` ${className}` : ''}`}
      style={{ background: book.coverUrl ? undefined : book.gradient }}
    >
      {book.coverUrl ? (
        <Image
          src={book.coverUrl}
          alt=""
          fill
          sizes="120px"
          className={blurred ? 'featured-adventure-cover-img--blur' : undefined}
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      ) : (
        <span className={`featured-adventure-emoji${blurred ? ' featured-adventure-emoji--blur' : ''}`}>
          {book.emoji}
        </span>
      )}
    </div>
  );
}

export default function FeaturedAdventure({ books, totalCount, loading, onViewAll }: FeaturedAdventureProps) {
  const picksRef = useRef<HTMLDivElement>(null);
  const [pickSlots, setPickSlots] = useState(3);

  const book = books[0] ?? null;
  const upcoming = books.slice(1);
  const total = totalCount ?? books.length;
  const moreCount = Math.max(0, total - 1);

  useEffect(() => {
    const el = picksRef.current;
    if (!el || upcoming.length === 0) return;

    const measure = () => {
      const height = el.clientHeight;
      if (height < PICK_ROW_HEIGHT) return;

      const reserveViewMore = upcoming.length > 1 ? VIEW_MORE_ROW_HEIGHT + PICK_GAP : 0;
      const available = Math.max(0, height - reserveViewMore);
      const slots = Math.max(1, Math.floor((available + PICK_GAP) / (PICK_ROW_HEIGHT + PICK_GAP)));
      setPickSlots(Math.min(slots, upcoming.length));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [upcoming.length]);

  const visiblePicks = upcoming.slice(0, pickSlots);
  const hiddenPickCount = Math.max(0, moreCount - visiblePicks.length);

  if (loading) {
    return (
      <section className="featured-adventure featured-adventure--loading">
        <div className="featured-adventure-header">
          <h2 className="featured-adventure-title">Your Next Adventure</h2>
        </div>
        <div className="featured-adventure-skeleton" />
      </section>
    );
  }

  if (!book) {
    return (
      <section className="featured-adventure featured-adventure--empty">
        <div className="featured-adventure-header">
          <h2 className="featured-adventure-title">Your Next Adventure</h2>
        </div>
        <p className="featured-adventure-empty">Take the quiz to unlock your first book pick!</p>
      </section>
    );
  }

  return (
    <section className="featured-adventure">
      <div className="featured-adventure-header">
        <h2 className="featured-adventure-title">Your Next Adventure</h2>
        <button type="button" className="featured-adventure-link" onClick={onViewAll}>
          View all
        </button>
      </div>

      <div className="featured-adventure-stack">
        <div className="featured-adventure-card">
          <button
            type="button"
            className="featured-adventure-open"
            onClick={() => { void openBookExternalUrl(book); }}
            aria-label={`Open ${book.title} on Google Books`}
          >
            <BookCover book={book} />
            <div className="featured-adventure-body">
              <div className="featured-adventure-top">
                <h3 className="featured-adventure-book-title">{book.title}</h3>
                <span className="featured-adventure-match">{book.match}% match</span>
              </div>
              <p className="featured-adventure-author">{book.author}</p>
              <div className="featured-adventure-tags">
                {book.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="featured-adventure-tag">{tag}</span>
                ))}
              </div>
              {book.description && (
                <p className="featured-adventure-desc">{book.description}</p>
              )}
            </div>
          </button>
            <div className="featured-adventure-actions">
              <button
                type="button"
                className="cta-btn featured-adventure-start"
                onClick={() => { void openBookExternalUrl(book); }}
              >
                Start Reading
              </button>
              <AddToQuestButton book={book} />
              <SaveBookButton book={book} className="featured-adventure-save" size="sm" />
            </div>
        </div>

        {upcoming.length > 0 && (
          <div className="featured-adventure-picks" ref={picksRef}>
            <p className="featured-adventure-picks-label">More picks for you</p>
            <ul className="featured-adventure-picks-list">
              {visiblePicks.map((pick) => (
                <li key={pick.id ?? `${pick.title}-${pick.author}`}>
                  <button type="button" className="featured-adventure-pick" onClick={() => { void openBookExternalUrl(pick); }}>
                    <BookCover book={pick} className="featured-adventure-cover--pick" />
                    <div className="featured-adventure-pick-info">
                      <span className="featured-adventure-pick-title">{pick.title}</span>
                      <span className="featured-adventure-pick-meta">
                        {pick.author} · {pick.match}% match
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {hiddenPickCount > 0 && (
              <button type="button" className="featured-adventure-view-more" onClick={onViewAll}>
                <span>
                  +{hiddenPickCount} more pick{hiddenPickCount !== 1 ? 's' : ''} waiting
                </span>
                <span className="featured-adventure-teaser-arrow" aria-hidden="true">→</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

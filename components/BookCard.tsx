'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import Image from 'next/image';
import type { Book } from '@/lib/types';
import { getAdventureLevel } from '@/lib/adventure-level';
import { openBookExternalUrl } from '@/lib/book-link';
import SaveBookButton from '@/components/SaveBookButton';
import AddToQuestButton from '@/components/AddToQuestButton';
import { formatPrice, hasPrice } from '@/lib/price';

interface BookCardProps {
  book: Book;
  showQuestAction?: boolean;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return !!(target as HTMLElement | null)?.closest('button, a, input, label');
}

export default function BookCard({ book, showQuestAction = false }: BookCardProps) {
  const adventure = getAdventureLevel(book.match);
  function openBook() {
    void openBookExternalUrl(book);
  }

  function handleCardClick(e: MouseEvent<HTMLDivElement>) {
    if (isInteractiveTarget(e.target)) return;
    openBook();
  }

  function handleCardKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (isInteractiveTarget(e.target)) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openBook();
    }
  }

  return (
    <div
      className="book-card book-card--adventure book-card--clickable"
      tabIndex={0}
      role="link"
      aria-label={`${book.title} by ${book.author}, ${book.match}% match, ${adventure.label}. Opens in Google Books.`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div
        className="book-cover-placeholder"
        style={{ background: book.coverUrl ? undefined : book.gradient }}
      >
        {book.coverUrl ? (
          <Image
            src={book.coverUrl}
            alt={book.title}
            fill
            sizes="(max-width: 600px) 50vw, 20vw"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <span style={{ fontSize: 42 }}>{book.emoji}</span>
        )}
        <div className="book-cover-overlay">
          {showQuestAction && <AddToQuestButton book={book} compact className="book-quest-btn" />}
          <SaveBookButton book={book} />
        </div>
      </div>
      <div className={`adventure-chip ${adventure.className}`}>
        <span className="adventure-chip-match">{book.match}% match</span>
        <span className="adventure-chip-label">{adventure.emoji} {adventure.label}</span>
      </div>
      <div className="book-info">
        <div className="book-title">{book.title}</div>
        <div className="book-author">{book.author}</div>
        <div className="book-tags">
          {book.tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
        {hasPrice(book) && (
          <div className="book-price">{formatPrice(book.price!, book.currency!)}</div>
        )}
      </div>
    </div>
  );
}

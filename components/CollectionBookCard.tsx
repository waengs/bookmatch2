'use client';

import Image from 'next/image';
import type { SavedBook } from '@/lib/firebase/collection';
import { formatPrice, hasPrice } from '@/lib/price';
import { openBookExternalUrl } from '@/lib/book-link';
import SaveBookButton from '@/components/SaveBookButton';

interface CollectionBookCardProps {
  book: SavedBook;
  selected: boolean;
  onToggleSelect: () => void;
  onWriteReview: () => void;
  onReadReview: () => void;
}

export default function CollectionBookCard({
  book,
  selected,
  onToggleSelect,
  onWriteReview,
  onReadReview,
}: CollectionBookCardProps) {
  const priced = hasPrice(book);
  const reviewed = !!book.review;

  return (
    <div className={`collection-book-card${selected ? ' collection-book-card--selected' : ''}`}>
      <label className="collection-book-select">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${book.title} for price total`}
        />
        <span className="collection-book-check" aria-hidden="true" />
      </label>

      <button
        type="button"
        className="collection-book-open"
        onClick={() => { void openBookExternalUrl(book); }}
        aria-label={`Open ${book.title} on Google Books`}
      >
        <div
          className="collection-book-cover"
          style={{ background: book.coverUrl ? undefined : book.gradient }}
        >
          {book.coverUrl ? (
            <Image
              src={book.coverUrl}
              alt=""
              fill
              sizes="80px"
              style={{ objectFit: 'cover' }}
              unoptimized
            />
          ) : (
            <span>{book.emoji}</span>
          )}
        </div>

        <div className="collection-book-info">
          <div className="collection-book-title">{book.title}</div>
          <div className="collection-book-author">{book.author}</div>
        {priced ? (
          <div className="collection-book-price">
            {formatPrice(book.price!, book.currency!)}
          </div>
        ) : (
          <div className="collection-book-price collection-book-price--na">Price unavailable</div>
        )}
        {reviewed && book.review && (
          <button type="button" className="collection-book-review-meta" onClick={onReadReview}>
            {'★'.repeat(book.review.rating)}{'☆'.repeat(5 - book.review.rating)}
            <span> · {book.review.wordCount} words · Read</span>
          </button>
        )}
        </div>
      </button>

      <div className="collection-book-actions">
        {reviewed ? (
          <button type="button" className="collection-review-btn" onClick={onReadReview}>
            Read review
          </button>
        ) : (
          <button type="button" className="collection-review-btn" onClick={onWriteReview}>
            Write review
          </button>
        )}
        <SaveBookButton book={book} className="collection-book-save" variant="remove" />
      </div>
    </div>
  );
}

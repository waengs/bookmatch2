'use client';

import { useState } from 'react';
import type { Book } from '@/lib/types';
import { collectionDocId } from '@/lib/book-id';
import { useCollection } from '@/context/CollectionContext';
import ConfirmDialog from '@/components/ConfirmDialog';

interface SaveBookButtonProps {
  book: Book;
  className?: string;
  size?: 'sm' | 'md';
  /** In My Collection — show ✕ remove instead of bookmark */
  variant?: 'bookmark' | 'remove';
}

export default function SaveBookButton({
  book,
  className = '',
  size = 'md',
  variant = 'bookmark',
}: SaveBookButtonProps) {
  const { isSaved, toggleSave, savingId, getReview } = useCollection();
  const saved = isSaved(book);
  const key = collectionDocId(book.title, book.author);
  const busy = savingId === key;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasReview = !!getReview(book);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (saved) {
      setConfirmOpen(true);
      return;
    }
    toggleSave(book);
  }

  async function handleConfirmRemove() {
    await toggleSave(book);
    setConfirmOpen(false);
  }

  const isRemove = variant === 'remove';

  return (
    <>
      <button
        type="button"
        className={`save-btn${saved || isRemove ? ' save-btn--saved' : ''}${isRemove ? ' save-btn--remove' : ''}${className ? ` ${className}` : ''}`}
        aria-label={saved || isRemove ? `Remove ${book.title} from collection` : `Save ${book.title} to collection`}
        aria-pressed={saved}
        disabled={busy}
        onClick={handleClick}
        style={size === 'sm' ? { width: 40, height: 40 } : undefined}
      >
        {isRemove ? (
          <span className="save-btn-remove-icon" aria-hidden="true">✕</span>
        ) : (
          <svg width={size === 'sm' ? 18 : 15} height={size === 'sm' ? 18 : 15} viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'}>
            <path
              d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove from collection?"
        message={
          hasReview
            ? `Are you sure you want to remove "${book.title}" from your collection? Your review for this book will be deleted too.`
            : `Are you sure you want to remove "${book.title}" from your collection?`
        }
        confirmLabel="Remove book"
        cancelLabel="Keep it"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmOpen(false)}
        loading={busy}
      />
    </>
  );
}

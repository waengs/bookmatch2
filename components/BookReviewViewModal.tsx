'use client';

import { useEffect } from 'react';
import type { QuestReview } from '@/lib/reading-quest';

interface BookReviewViewModalProps {
  title: string;
  author: string;
  review: QuestReview | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

function formatReviewDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BookReviewViewModal({
  title,
  author,
  review,
  open,
  onClose,
  onEdit,
}: BookReviewViewModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !review) return null;

  return (
    <div
      className="quiz-overlay active"
      role="dialog"
      aria-modal="true"
      aria-label={`Your review of ${title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="review-modal review-modal--read">
        <button type="button" className="quiz-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <h2 className="review-modal-title">Your review</h2>
        <p className="review-modal-book">{title} · {author}</p>

        <div className="review-read-stars" aria-label={`${review.rating} out of 5 stars`}>
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
          <span className="review-read-rating-label">{review.rating} / 5</span>
        </div>

        <p className="review-read-meta">
          {review.wordCount} words
          {review.submittedAt && ` · ${formatReviewDate(review.submittedAt)}`}
        </p>

        <div className="review-read-body">{review.text}</div>

        <div className="review-read-actions">
          {onEdit && (
            <button type="button" className="cta-btn cta-btn--outline" onClick={onEdit}>
              Edit review
            </button>
          )}
          <button type="button" className="cta-btn cta-btn--primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

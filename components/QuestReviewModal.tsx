'use client';

import { FormEvent, useEffect, useState } from 'react';
import type { Book } from '@/lib/types';
import { countReviewWords, MIN_REVIEW_WORDS } from '@/lib/reading-quest';
import { useReadingQuest } from '@/context/ReadingQuestContext';

interface QuestReviewModalProps {
  book: Book | null;
  open: boolean;
  onClose: () => void;
  onSubmit?: (book: Book, rating: number, text: string) => Promise<boolean>;
  initialRating?: number;
  initialText?: string;
}

export default function QuestReviewModal({
  book,
  open,
  onClose,
  onSubmit,
  initialRating = 0,
  initialText = '',
}: QuestReviewModalProps) {
  const { submitReview: submitQuestReview } = useReadingQuest();
  const submitReview = onSubmit ?? submitQuestReview;
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && book) {
      setRating(initialRating);
      setText(initialText);
      setError(null);
    }
  }, [open, book, initialRating, initialText]);

  if (!open || !book) return null;

  const wordCount = countReviewWords(text);
  const wordsLeft = Math.max(0, MIN_REVIEW_WORDS - wordCount);
  const canSubmit = rating >= 1 && wordCount >= MIN_REVIEW_WORDS && !saving;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!book || !canSubmit) return;
    setError(null);
    setSaving(true);
    const ok = await submitReview(book, rating, text);
    setSaving(false);
    if (ok) {
      setRating(0);
      setText('');
      onClose();
    } else {
      setError('Could not save your review. Please try again.');
    }
  }

  return (
    <div
      className="quiz-overlay active"
      role="dialog"
      aria-modal="true"
      aria-label={`Review ${book.title}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="review-modal">
        <button type="button" className="quiz-close" aria-label="Close" onClick={onClose}>✕</button>
        <h2 className="review-modal-title">Write your review</h2>
        <p className="review-modal-book">{book.title} · {book.author}</p>
        <p className="review-modal-hint">
          Share what you thought in at least {MIN_REVIEW_WORDS} words and rate the book to mark it complete.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="star-rating" role="group" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn${(hover || rating) >= star ? ' star-btn--on' : ''}`}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
            <span className="star-rating-label">
              {rating > 0 ? `${rating} / 5` : 'Tap to rate'}
            </span>
          </div>

          <label className="review-field">
            <span className="review-field-label">Your review</span>
            <textarea
              className="review-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="What did you love? Who would you recommend it to?"
              required
            />
            <span className={`review-word-count${wordCount >= MIN_REVIEW_WORDS ? ' review-word-count--ok' : ''}`}>
              {wordCount} / {MIN_REVIEW_WORDS} words
              {wordsLeft > 0 && ` (${wordsLeft} more needed)`}
            </span>
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <button type="submit" className="cta-btn cta-btn--primary review-submit" disabled={!canSubmit}>
            {saving ? 'Saving…' : initialRating > 0 ? 'Update review' : 'Submit review'}
          </button>
        </form>
      </div>
    </div>
  );
}

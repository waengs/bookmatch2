'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useBookMatch } from '@/context/BookMatchContext';
import { useReadingQuest } from '@/context/ReadingQuestContext';
import {
  isQuestBookReviewed,
  MIN_REVIEW_WORDS,
  QUEST_BOOK_GOAL,
  type QuestBookEntry,
} from '@/lib/reading-quest';
import type { Book } from '@/lib/types';
import QuestReviewModal from '@/components/QuestReviewModal';
import BookReviewViewModal from '@/components/BookReviewViewModal';

export default function ReaderQuest() {
  const { data: session } = useSession();
  const { books: recommendations } = useBookMatch();
  const {
    quest,
    loading,
    isSignedIn,
    booksCount,
    reviewedCount,
    slotsLeft,
    isComplete,
    addAllRecommendations,
    fillFromRecommendations,
    removeBook,
  } = useReadingQuest();

  const [reviewBook, setReviewBook] = useState<Book | null>(null);
  const [reviewEntry, setReviewEntry] = useState<QuestBookEntry | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [readEntry, setReadEntry] = useState<QuestBookEntry | null>(null);
  const [readOpen, setReadOpen] = useState(false);

  const pct = Math.round((reviewedCount / QUEST_BOOK_GOAL) * 100);

  if (!isSignedIn && !session?.user) {
    return (
      <section className="quest-card quest-card--mock quest-card--guest" id="section-quest">
        <div className="quest-card-header">
          <span className="quest-card-icon-wrap">🎯</span>
          <div>
            <h2 className="quest-card-title">Reading Quest</h2>
            <p className="quest-card-sub">Sign in to read 10 books and earn your quest badge!</p>
          </div>
        </div>
        <Link href="/login" className="cta-btn cta-btn--primary quest-signin-btn">
          Sign in to start
        </Link>
      </section>
    );
  }

  const recs = recommendations.slice(0, QUEST_BOOK_GOAL);

  function entryToBook(entry: QuestBookEntry): Book {
    return {
      id: entry.id,
      title: entry.title,
      author: entry.author,
      match: entry.match,
      tags: entry.tags,
      coverUrl: entry.coverUrl,
      emoji: entry.emoji,
      gradient: entry.gradient,
    };
  }

  function openReview(entry: QuestBookEntry) {
    setReviewEntry(entry);
    setReviewBook(entryToBook(entry));
    setReviewOpen(true);
  }

  function openReadReview(entry: QuestBookEntry) {
    if (!entry.review) return;
    setReadEntry(entry);
    setReadOpen(true);
  }

  function handleEditFromRead() {
    if (!readEntry) return;
    setReadOpen(false);
    openReview(readEntry);
  }

  return (
    <>
      <section className="quest-card quest-card--mock quest-card--reading" id="section-quest">
        <div className="quest-card-header">
          <span className="quest-card-icon-wrap">🎯</span>
          <div>
            <h2 className="quest-card-title">Reading Quest</h2>
            <p className="quest-card-sub">
              {isComplete
                ? 'You finished all 10 books — amazing work!'
                : `Read ${QUEST_BOOK_GOAL} books and write a ${MIN_REVIEW_WORDS}+ word review for each.`}
            </p>
          </div>
        </div>

        <div className="quest-card-body">
          <div className="quest-task">
            <span className="quest-task-label">📚 Reviews completed</span>
            <span className="quest-task-progress">{reviewedCount} / {QUEST_BOOK_GOAL}</span>
          </div>
          <div className="quest-task">
            <span className="quest-task-label">📖 Books in quest</span>
            <span className="quest-task-progress">{booksCount} / {QUEST_BOOK_GOAL}</span>
          </div>
          <div
            className="quest-progress-bar"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="quest-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {!isComplete && recs.length > 0 && (
            <div className="quest-fill-actions">
              <button
                type="button"
                className="collection-calc-btn"
                disabled={loading || booksCount >= QUEST_BOOK_GOAL}
                onClick={() => addAllRecommendations(recs)}
              >
                Add all recommendations
              </button>
              {booksCount > 0 && booksCount < QUEST_BOOK_GOAL && (
                <button
                  type="button"
                  className="collection-calc-btn"
                  disabled={loading || slotsLeft === 0}
                  onClick={() => fillFromRecommendations(recs)}
                >
                  Fill to {QUEST_BOOK_GOAL} ({slotsLeft} left)
                </button>
              )}
            </div>
          )}

          {loading && !quest && <div className="quest-loading">Loading quest…</div>}

          {!loading && quest && quest.books.length > 0 && (
            <ul className="quest-book-list">
              {quest.books.map((entry) => {
                const done = isQuestBookReviewed(entry);
                return (
                  <li key={entry.docId} className={`quest-book-item${done ? ' quest-book-item--done' : ''}`}>
                    <div
                      className="quest-book-item-cover"
                      style={{ background: entry.coverUrl ? undefined : entry.gradient }}
                    >
                      {entry.coverUrl ? (
                        <Image src={entry.coverUrl} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                      ) : (
                        entry.emoji
                      )}
                    </div>
                    <div className="quest-book-item-info">
                      <div className="quest-book-item-title">{entry.title}</div>
                      <div className="quest-book-item-author">{entry.author}</div>
                      {done && entry.review && (
                        <button
                          type="button"
                          className="quest-book-item-review"
                          onClick={() => openReadReview(entry)}
                        >
                          {'★'.repeat(entry.review.rating)}{'☆'.repeat(5 - entry.review.rating)}
                          <span> · {entry.review.wordCount} words · Read</span>
                        </button>
                      )}
                    </div>
                    <div className="quest-book-item-actions">
                      {!done && !isComplete && (
                        <button
                          type="button"
                          className="cta-btn cta-btn--sm"
                          onClick={() => openReview(entry)}
                        >
                          Write review
                        </button>
                      )}
                      {done && (
                        <button
                          type="button"
                          className="cta-btn cta-btn--sm quest-book-read-btn"
                          onClick={() => openReadReview(entry)}
                        >
                          Read review
                        </button>
                      )}
                      {!isComplete && (
                        <button
                          type="button"
                          className="quest-book-remove"
                          aria-label={`Remove ${entry.title}`}
                          onClick={() => removeBook(entry)}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!loading && booksCount === 0 && (
            <p className="quest-empty-hint">
              Add books from Explore search or your recommendations using &quot;Add to quest&quot;.
            </p>
          )}

          {isComplete && (
            <div className="quest-complete-banner">Quest complete! 🎉 +100 XP</div>
          )}
        </div>
      </section>

      <QuestReviewModal
        book={reviewBook}
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setReviewBook(null);
          setReviewEntry(null);
        }}
        initialRating={reviewEntry?.review?.rating ?? 0}
        initialText={reviewEntry?.review?.text ?? ''}
      />
      <BookReviewViewModal
        title={readEntry?.title ?? ''}
        author={readEntry?.author ?? ''}
        review={readEntry?.review ?? null}
        open={readOpen}
        onClose={() => {
          setReadOpen(false);
          setReadEntry(null);
        }}
        onEdit={readEntry ? handleEditFromRead : undefined}
      />
    </>
  );
}

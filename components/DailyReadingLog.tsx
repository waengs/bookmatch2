'use client';

import { FormEvent, useState } from 'react';
import { useJourney } from '@/context/JourneyContext';
import { getTodayReadingLog, hasLoggedReadingToday } from '@/lib/gamification';

const MIN_SUMMARY_CHARS = 10;

interface DailyReadingLogProps {
  compact?: boolean;
}

export default function DailyReadingLog({ compact = false }: DailyReadingLogProps) {
  const { journey, logDailyReading } = useJourney();
  const [bookTitle, setBookTitle] = useState('');
  const [pages, setPages] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loggedToday = hasLoggedReadingToday(journey);
  const todayLog = getTodayReadingLog(journey);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedTitle = bookTitle.trim();
    const trimmedSummary = summary.trim();
    const pageCount = Number.parseInt(pages, 10);

    if (!trimmedTitle) {
      setError('Tell us which book you read today.');
      return;
    }
    if (!Number.isFinite(pageCount) || pageCount < 1) {
      setError('Enter how many pages you read (at least 1).');
      return;
    }
    if (trimmedSummary.length < MIN_SUMMARY_CHARS) {
      setError(`Share a little about what you read (at least ${MIN_SUMMARY_CHARS} characters).`);
      return;
    }

    const ok = logDailyReading({
      bookTitle: trimmedTitle,
      pages: pageCount,
      summary: trimmedSummary,
    });

    if (!ok) {
      setError('You already logged reading for today.');
      return;
    }

    setBookTitle('');
    setPages('');
    setSummary('');
    setSaved(true);
  }

  return (
    <section
      className={`daily-reading-card quest-card quest-card--mock${compact ? ' daily-reading-card--compact' : ''}`}
      id="section-daily-reading"
    >
      <div className="quest-card-header">
        <span className="quest-card-icon-wrap">🔥</span>
        <div>
          <h2 className="quest-card-title">Daily reading check-in</h2>
          <p className="quest-card-sub">
            Log what you read today to keep your {journey.streak}-day streak going!
          </p>
        </div>
      </div>

      {loggedToday && todayLog ? (
        <div className="daily-reading-done">
          <p className="daily-reading-done-title">You logged reading today — nice work!</p>
          <dl className="daily-reading-summary">
            <div className="daily-reading-summary-row">
              <dt>Book</dt>
              <dd>{todayLog.bookTitle}</dd>
            </div>
            <div className="daily-reading-summary-row">
              <dt>Pages</dt>
              <dd>{todayLog.pages}</dd>
            </div>
            <div className="daily-reading-summary-row">
              <dt>What it was about</dt>
              <dd>{todayLog.summary}</dd>
            </div>
          </dl>
          {saved && (
            <p className="daily-reading-success" role="status">
              Streak updated! Come back tomorrow for your next check-in.
            </p>
          )}
        </div>
      ) : (
        <form className="daily-reading-form" onSubmit={handleSubmit}>
          <div className="review-field">
            <label className="review-field-label" htmlFor="daily-book-title">
              What book did you read?
            </label>
            <input
              id="daily-book-title"
              type="text"
              className="daily-reading-input"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g. The Wild Robot"
              maxLength={120}
              autoComplete="off"
            />
          </div>

          <div className="review-field">
            <label className="review-field-label" htmlFor="daily-pages">
              How many pages did you read?
            </label>
            <input
              id="daily-pages"
              type="number"
              min={1}
              max={9999}
              className="daily-reading-input daily-reading-input--pages"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="10"
            />
          </div>

          <div className="review-field">
            <label className="review-field-label" htmlFor="daily-summary">
              What was it about?
            </label>
            <textarea
              id="daily-summary"
              className="review-textarea daily-reading-textarea"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A few sentences about what happened or what you learned…"
              rows={compact ? 3 : 4}
              maxLength={500}
            />
            <span className="review-word-count">
              {summary.trim().length}/{MIN_SUMMARY_CHARS} characters minimum
            </span>
          </div>

          {error && (
            <p className="daily-reading-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="cta-btn cta-btn--primary daily-reading-submit">
            Log today&apos;s reading →
          </button>
        </form>
      )}
    </section>
  );
}

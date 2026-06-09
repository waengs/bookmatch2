'use client';

import BookCard from '@/components/BookCard';
import type { Book } from '@/lib/types';

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  title: string;
  hasReaderType: boolean;
  onTakeQuiz: () => void;
  showQuestActions?: boolean;
}

export default function BookGrid({
  books,
  loading,
  title,
  hasReaderType,
  onTakeQuiz,
  showQuestActions = false,
}: BookGridProps) {
  return (
    <section className="shelf-section" id="section-matches">
      <div className="shelf-header">
        <h2 className="shelf-title">{title}</h2>
        {hasReaderType && <a href="#section-search" className="see-all">Search books →</a>}
      </div>
      {loading ? (
        <div className="shelf-loading">Searching the magical library… ✨</div>
      ) : !hasReaderType ? (
        <div className="shelf-empty shelf-empty--adventure">
          <div className="shelf-empty-icon">🗺️</div>
          <h3 className="shelf-empty-title">Your adventure map is blank!</h3>
          <p className="shelf-empty-desc">
            Discover your reader type first — then we&apos;ll unlock stories made just for you.
          </p>
          <button type="button" className="cta-btn cta-btn--magic" onClick={onTakeQuiz}>
            Discover My Reader Type ✨
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="shelf-loading">No adventures found yet — try the quiz again!</div>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} showQuestAction={showQuestActions} />
          ))}
        </div>
      )}
    </section>
  );
}

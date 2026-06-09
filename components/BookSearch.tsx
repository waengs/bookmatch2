'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import type { Book } from '@/lib/types';
import { SEARCH_GENRES } from '@/lib/search-genres';
import BookCard from '@/components/BookCard';

export default function BookSearch() {
  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (q: string, genres: string[]) => {
    const trimmed = q.trim();
    if (!trimmed && genres.length === 0) {
      setResults([]);
      setHasSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (trimmed) params.set('q', trimmed);
      if (genres.length) params.set('genres', genres.join(','));
      params.set('limit', '20');

      const res = await fetch(`/api/books/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResults(data.books ?? []);
    } catch {
      setError('Could not search right now. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(query, selectedGenres);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, selectedGenres, runSearch]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query, selectedGenres);
  }

  function toggleGenre(id: string) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  function clearFilters() {
    setQuery('');
    setSelectedGenres([]);
    setResults([]);
    setHasSearched(false);
    setError(null);
  }

  const activeFilterCount = selectedGenres.length + (query.trim() ? 1 : 0);

  return (
    <section className="book-search" id="section-search">
      <div className="book-search-header">
        <h2 className="book-search-title">🔎 Find your next book</h2>
        <p className="book-search-sub">Search by title or author, and mix genre filters to narrow your adventure.</p>
      </div>

      <form className="book-search-form" onSubmit={handleSubmit}>
        <div className="book-search-bar">
          <span className="book-search-icon" aria-hidden="true">🔍</span>
          <input
            type="search"
            className="book-search-input"
            placeholder="Search books, authors, series…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search books"
          />
          {query && (
            <button
              type="button"
              className="book-search-clear"
              aria-label="Clear search"
              onClick={() => setQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" className="cta-btn cta-btn--primary book-search-submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      <div className="book-search-filters">
        <div className="book-search-filters-head">
          <span className="book-search-filters-label">Genres</span>
          {activeFilterCount > 0 && (
            <button type="button" className="book-search-clear-filters" onClick={clearFilters}>
              Clear all
            </button>
          )}
        </div>
        <div className="genre-filter-chips" role="group" aria-label="Genre filters">
          {SEARCH_GENRES.map((genre) => {
            const active = selectedGenres.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                className={`genre-filter-chip${active ? ' genre-filter-chip--active' : ''}`}
                aria-pressed={active}
                onClick={() => toggleGenre(genre.id)}
              >
                <span className="genre-filter-chip-emoji">{genre.emoji}</span>
                {genre.label}
              </button>
            );
          })}
        </div>
        {selectedGenres.length > 0 && (
          <p className="book-search-filter-hint">
            Showing books that match any of:{' '}
            {selectedGenres
              .map((id) => SEARCH_GENRES.find((g) => g.id === id)?.label)
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        <p className="explore-save-hint">
          Signed in? Tap the bookmark on any book to save it to your collection.
        </p>
      </div>

      <div className="book-search-results">
        {loading && (
          <div className="shelf-loading">Searching the magical library… ✨</div>
        )}
        {!loading && error && (
          <p className="book-search-error" role="alert">{error}</p>
        )}
        {!loading && !error && hasSearched && results.length === 0 && (
          <div className="shelf-empty shelf-empty--adventure">
            <div className="shelf-empty-icon">📚</div>
            <h3 className="shelf-empty-title">No books found</h3>
            <p className="shelf-empty-desc">Try a different search or pick fewer genre filters.</p>
          </div>
        )}
        {!loading && results.length > 0 && (
          <>
            <p className="book-search-count">{results.length} book{results.length !== 1 ? 's' : ''} found</p>
            <div className="book-grid">
              {results.map((book) => (
                <BookCard key={book.id} book={book} showQuestAction />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

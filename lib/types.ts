export type ReaderTypeId =
  | 'dreamer'
  | 'adventurer'
  | 'detective'
  | 'romantic'
  | 'comfort'
  | 'thinker'
  | 'shadow'
  | 'challenger';

export interface GenreCard {
  name: string;
  emoji: string;
  gradient: string;
}

export interface ReaderType {
  id: ReaderTypeId;
  name: string;
  adventureTitle: string;
  emoji: string;
  description: string;
  kidTagline: string;
  likes: string[];
  recommendedCategories: string[];
  tags: string[];
  genreLabel: string;
  genres: GenreCard[];
  searchGenres: string[];
  searchMoods: string[];
  searchQueries: string[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  match: number;
  rating?: number;
  reviews?: string;
  tags: string[];
  coverUrl?: string;
  emoji: string;
  gradient: string;
  description?: string;
  source?: string;
  /** Google Books (or fallback) page for this title */
  externalUrl?: string;
  /** Retail/list price when available from Google Books */
  price?: number;
  currency?: string;
}

export interface QuizOption {
  emoji: string;
  label: string;
  desc?: string;
  gradient?: string;
  coverUrl?: string;
  coverBook?: string;
  scores: Partial<Record<ReaderTypeId, number>>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  isCover?: boolean;
  options: QuizOption[];
}

export interface MatchBooksResponse {
  books: Book[];
  source: 'live' | 'fallback';
  readerType: ReaderTypeId;
}

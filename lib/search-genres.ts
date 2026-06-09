export interface SearchGenre {
  id: string;
  label: string;
  emoji: string;
  /** Terms used when querying book APIs */
  terms: string[];
}

export const SEARCH_GENRES: SearchGenre[] = [
  { id: 'fantasy', label: 'Fantasy', emoji: '🐉', terms: ['fantasy', 'magic'] },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️', terms: ['adventure', 'quest'] },
  { id: 'mystery', label: 'Mystery', emoji: '🔍', terms: ['mystery', 'detective'] },
  { id: 'science-fiction', label: 'Sci-Fi', emoji: '🚀', terms: ['science fiction', 'space'] },
  { id: 'humor', label: 'Humor', emoji: '😂', terms: ['humor', 'funny'] },
  { id: 'historical', label: 'Historical', emoji: '🏛️', terms: ['historical', 'history'] },
  { id: 'animals', label: 'Animals', emoji: '🐾', terms: ['animals', 'pets'] },
  { id: 'friendship', label: 'Friendship', emoji: '💛', terms: ['friendship', 'friends'] },
  { id: 'magic', label: 'Magic', emoji: '✨', terms: ['magic', 'wizards'] },
  { id: 'comics', label: 'Comics', emoji: '💬', terms: ['comics', 'graphic novel'] },
  { id: 'biography', label: 'Biography', emoji: '📖', terms: ['biography', 'memoir'] },
  { id: 'poetry', label: 'Poetry', emoji: '🌸', terms: ['poetry', 'poems'] },
  { id: 'horror', label: 'Spooky', emoji: '👻', terms: ['horror', 'ghost'] },
  { id: 'romance', label: 'Romance', emoji: '💕', terms: ['romance', 'love'] },
];

const genreById = new Map(SEARCH_GENRES.map((g) => [g.id, g]));

export function getSearchGenre(id: string): SearchGenre | undefined {
  return genreById.get(id);
}

export function resolveGenreIds(ids: string[]): SearchGenre[] {
  return ids.map((id) => getSearchGenre(id)).filter((g): g is SearchGenre => !!g);
}

export function genreHaystackTerms(genres: SearchGenre[]): string[] {
  return genres.flatMap((g) => [g.label, ...g.terms]).map((t) => t.toLowerCase());
}

import type { Book } from './types';

const GRADIENTS = [
  'linear-gradient(160deg, #2d4330 0%, #5f8d62 60%, #a8c4a9 100%)',
  'linear-gradient(160deg, #1e2d20 0%, #3b5940 60%, #7fa882 100%)',
  'linear-gradient(160deg, #2d4330 0%, #4a7050 60%, #ccdccd 100%)',
  'linear-gradient(160deg, #1e2d20 0%, #3b5940 60%, #e4cc90 100%)',
  'linear-gradient(160deg, #2d4330 0%, #5f8d62 60%, #f0e2ba 100%)',
];

const EMOJIS = ['🌌', '🚀', '🏡', '🎪', '🎸', '🕵️', '🎭', '🏜️', '🌸', '🖤'];

export const fallbackBooksByType: Record<string, Book[]> = {
  dreamer: [
    { id: 'fb-midnight', title: 'The Midnight Library', author: 'Matt Haig', match: 96, rating: 4.6, reviews: '12,560', tags: ['Fiction', 'Fantasy'], emoji: '🌌', gradient: GRADIENTS[0] },
    { id: 'fb-circus', title: 'The Night Circus', author: 'Erin Morgenstern', match: 93, rating: 4.4, reviews: '15,320', tags: ['Fantasy', 'Romance'], emoji: '🎪', gradient: GRADIENTS[3] },
    { id: 'fb-cerulean', title: 'The House in the Cerulean Sea', author: 'TJ Klune', match: 90, rating: 4.6, reviews: '9,870', tags: ['Fantasy', 'LGBTQ+'], emoji: '🏡', gradient: GRADIENTS[2] },
    { id: 'fb-ocean', title: 'The Ocean at the End of the Lane', author: 'Neil Gaiman', match: 88, rating: 4.2, reviews: '8,900', tags: ['Fantasy', 'Fiction'], emoji: '🌊', gradient: GRADIENTS[1] },
    { id: 'fb-stardust', title: 'Stardust', author: 'Neil Gaiman', match: 85, rating: 4.3, reviews: '6,200', tags: ['Fantasy', 'Adventure'], emoji: '✨', gradient: GRADIENTS[4] },
  ],
  adventurer: [
    { id: 'fb-hail-mary', title: 'Project Hail Mary', author: 'Andy Weir', match: 96, rating: 4.8, reviews: '8,204', tags: ['Sci-Fi', 'Adventure'], emoji: '🚀', gradient: GRADIENTS[1] },
    { id: 'fb-dune', title: 'Dune', author: 'Frank Herbert', match: 93, rating: 4.5, reviews: '31,200', tags: ['Sci-Fi', 'Adventure'], emoji: '🏜️', gradient: GRADIENTS[4] },
    { id: 'fb-hobbit', title: 'The Hobbit', author: 'J.R.R. Tolkien', match: 90, rating: 4.7, reviews: '45,000', tags: ['Fantasy', 'Adventure'], emoji: '🗡️', gradient: GRADIENTS[0] },
    { id: 'fb-martian', title: 'The Martian', author: 'Andy Weir', match: 88, rating: 4.6, reviews: '22,100', tags: ['Sci-Fi', 'Survival'], emoji: '🔴', gradient: GRADIENTS[1] },
    { id: 'fb-name-wind', title: 'The Name of the Wind', author: 'Patrick Rothfuss', match: 85, rating: 4.5, reviews: '18,400', tags: ['Fantasy', 'Epic'], emoji: '🎻', gradient: GRADIENTS[3] },
  ],
  detective: [
    { id: 'fb-gone-girl', title: 'Gone Girl', author: 'Gillian Flynn', match: 96, rating: 4.1, reviews: '22,400', tags: ['Thriller', 'Mystery'], emoji: '🕵️', gradient: GRADIENTS[1] },
    { id: 'fb-silent', title: 'The Silent Patient', author: 'Alex Michaelides', match: 93, rating: 4.2, reviews: '18,900', tags: ['Thriller', 'Mystery'], emoji: '🎭', gradient: GRADIENTS[0] },
    { id: 'fb-girl-dragon', title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', match: 90, rating: 4.1, reviews: '14,800', tags: ['Crime', 'Mystery'], emoji: '🐉', gradient: GRADIENTS[1] },
    { id: 'fb-big-little', title: 'Big Little Lies', author: 'Liane Moriarty', match: 88, rating: 4.3, reviews: '11,600', tags: ['Mystery', 'Drama'], emoji: '🌊', gradient: GRADIENTS[2] },
    { id: 'fb-thursday', title: 'The Thursday Murder Club', author: 'Richard Osman', match: 85, rating: 4.0, reviews: '9,300', tags: ['Mystery', 'Cozy'], emoji: '☕', gradient: GRADIENTS[4] },
  ],
  romantic: [
    { id: 'fb-beach', title: 'Beach Read', author: 'Emily Henry', match: 96, rating: 4.2, reviews: '11,300', tags: ['Romance', 'Fiction'], emoji: '🌸', gradient: GRADIENTS[2] },
    { id: 'fb-daisy', title: 'Daisy Jones & The Six', author: 'Taylor Jenkins Reid', match: 93, rating: 4.3, reviews: '7,104', tags: ['Historical', 'Fiction'], emoji: '🎸', gradient: GRADIENTS[4] },
    { id: 'fb-normal', title: 'Normal People', author: 'Sally Rooney', match: 90, rating: 4.0, reviews: '16,700', tags: ['Romance', 'Literary'], emoji: '💕', gradient: GRADIENTS[0] },
    { id: 'fb-me-before', title: 'Me Before You', author: 'Jojo Moyes', match: 88, rating: 4.3, reviews: '20,500', tags: ['Romance', 'Drama'], emoji: '❤️', gradient: GRADIENTS[3] },
    { id: 'fb-people-we', title: 'People We Meet on Vacation', author: 'Emily Henry', match: 85, rating: 4.1, reviews: '8,800', tags: ['Romance', 'Contemporary'], emoji: '✈️', gradient: GRADIENTS[2] },
  ],
  comfort: [
    { id: 'fb-cerulean-c', title: 'The House in the Cerulean Sea', author: 'TJ Klune', match: 96, rating: 4.6, reviews: '9,870', tags: ['Fantasy', 'Cozy'], emoji: '🏡', gradient: GRADIENTS[2] },
    { id: 'fb-midnight-c', title: 'The Midnight Library', author: 'Matt Haig', match: 93, rating: 4.6, reviews: '12,560', tags: ['Fiction', 'Fantasy'], emoji: '🌌', gradient: GRADIENTS[0] },
    { id: 'fb-legends', title: 'Legends & Lattes', author: 'Travis Baldree', match: 90, rating: 4.2, reviews: '5,400', tags: ['Cozy Fantasy', 'Fiction'], emoji: '☕', gradient: GRADIENTS[4] },
    { id: 'fb-anxious', title: 'Anxious People', author: 'Fredrik Backman', match: 88, rating: 4.3, reviews: '7,900', tags: ['Fiction', 'Feel-Good'], emoji: '🏘️', gradient: GRADIENTS[2] },
    { id: 'fb-eleanor', title: 'Eleanor Oliphant Is Completely Fine', author: 'Gail Honeyman', match: 85, rating: 4.3, reviews: '10,200', tags: ['Fiction', 'Contemporary'], emoji: '🌱', gradient: GRADIENTS[1] },
  ],
  thinker: [
    { id: 'fb-hail-t', title: 'Project Hail Mary', author: 'Andy Weir', match: 96, rating: 4.8, reviews: '8,204', tags: ['Sci-Fi', 'Adventure'], emoji: '🚀', gradient: GRADIENTS[1] },
    { id: 'fb-dune-t', title: 'Dune', author: 'Frank Herbert', match: 93, rating: 4.5, reviews: '31,200', tags: ['Sci-Fi', 'Epic'], emoji: '🏜️', gradient: GRADIENTS[4] },
    { id: 'fb-neuromancer', title: 'Neuromancer', author: 'William Gibson', match: 90, rating: 4.0, reviews: '6,800', tags: ['Sci-Fi', 'Cyberpunk'], emoji: '💻', gradient: GRADIENTS[1] },
    { id: 'fb-left-hand', title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', match: 88, rating: 4.2, reviews: '5,600', tags: ['Sci-Fi', 'Philosophy'], emoji: '❄️', gradient: GRADIENTS[0] },
    { id: 'fb-three-body', title: 'The Three-Body Problem', author: 'Liu Cixin', match: 85, rating: 4.1, reviews: '9,100', tags: ['Sci-Fi', 'Hard SF'], emoji: '🌌', gradient: GRADIENTS[1] },
  ],
  shadow: [
    { id: 'fb-shining', title: 'The Shining', author: 'Stephen King', match: 96, rating: 4.3, reviews: '28,700', tags: ['Horror', 'Fiction'], emoji: '🖤', gradient: GRADIENTS[1] },
    { id: 'fb-mexican', title: 'Mexican Gothic', author: 'Silvia Moreno-Garcia', match: 93, rating: 3.9, reviews: '6,400', tags: ['Horror', 'Gothic'], emoji: '🏚️', gradient: GRADIENTS[0] },
    { id: 'fb-only', title: 'The Only Good Indians', author: 'Stephen Graham Jones', match: 90, rating: 4.0, reviews: '4,200', tags: ['Horror', 'Literary'], emoji: '🌲', gradient: GRADIENTS[1] },
    { id: 'fb-bird-box', title: 'Bird Box', author: 'Josh Malerman', match: 88, rating: 3.9, reviews: '8,100', tags: ['Horror', 'Thriller'], emoji: '👁️', gradient: GRADIENTS[1] },
    { id: 'fb-ninth', title: 'Ninth House', author: 'Leigh Bardugo', match: 85, rating: 4.0, reviews: '7,300', tags: ['Dark Fantasy', 'Horror'], emoji: '🕯️', gradient: GRADIENTS[0] },
  ],
  challenger: [
    { id: 'fb-midnight-ch', title: 'The Midnight Library', author: 'Matt Haig', match: 96, rating: 4.6, reviews: '12,560', tags: ['Fiction', 'Literary'], emoji: '🌌', gradient: GRADIENTS[0] },
    { id: 'fb-gone-ch', title: 'Gone Girl', author: 'Gillian Flynn', match: 93, rating: 4.1, reviews: '22,400', tags: ['Thriller', 'Literary'], emoji: '🕵️', gradient: GRADIENTS[1] },
    { id: 'fb-kite', title: 'The Kite Runner', author: 'Khaled Hosseini', match: 90, rating: 4.4, reviews: '19,800', tags: ['Literary', 'Drama'], emoji: '🪁', gradient: GRADIENTS[3] },
    { id: 'fb-bell-jar', title: 'The Bell Jar', author: 'Sylvia Plath', match: 88, rating: 4.0, reviews: '8,500', tags: ['Literary', 'Classic'], emoji: '📖', gradient: GRADIENTS[0] },
    { id: 'fb-remains', title: 'A Little Life', author: 'Hanya Yanagihara', match: 85, rating: 4.2, reviews: '12,100', tags: ['Literary', 'Drama'], emoji: '🔥', gradient: GRADIENTS[1] },
  ],
};

export function getFallbackBooks(typeId: string, limit = 10): Book[] {
  const primary = fallbackBooksByType[typeId] ?? fallbackBooksByType.dreamer;
  if (primary.length >= limit) return primary.slice(0, limit);

  const seen = new Set(primary.map((b) => `${b.title}|${b.author}`));
  const extra: Book[] = [];

  for (const books of Object.values(fallbackBooksByType)) {
    for (const book of books) {
      const key = `${book.title}|${book.author}`;
      if (seen.has(key)) continue;
      seen.add(key);
      extra.push({
        ...book,
        id: `fb-pool-${extra.length}-${book.id}`,
        match: Math.max(82, book.match - 4),
      });
      if (primary.length + extra.length >= limit) break;
    }
    if (primary.length + extra.length >= limit) break;
  }

  return [...primary, ...extra].slice(0, limit);
}

export function pickEmoji(index: number): string {
  return EMOJIS[index % EMOJIS.length];
}

export function pickGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

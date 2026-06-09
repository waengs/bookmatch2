import type { QuizQuestion } from './types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'mood',
    question: 'What feeling do you chase in a book?',
    options: [
      { emoji: '🌱', label: 'Comfort', desc: 'A warm story that feels like home', scores: { comfort: 3, romantic: 1 } },
      { emoji: '🌙', label: 'Wonder', desc: 'Something magical and impossible', scores: { dreamer: 3, thinker: 1 } },
      { emoji: '🔥', label: 'Excitement', desc: 'High stakes and adventure', scores: { adventurer: 3, challenger: 1 } },
      { emoji: '💔', label: 'Emotion', desc: 'Stories that stay with you', scores: { romantic: 2, challenger: 2, dreamer: 1 } },
    ],
  },
  {
    id: 'character',
    question: 'Who do you want to follow?',
    options: [
      { emoji: '🗡️', label: 'The Hero', desc: 'Brave, determined, changing the world', scores: { adventurer: 3, dreamer: 1 } },
      { emoji: '🦊', label: 'The Outsider', desc: 'Misunderstood but special', scores: { dreamer: 2, shadow: 2, comfort: 1 } },
      { emoji: '🧠', label: 'The Genius', desc: 'Clever, strategic, solving problems', scores: { thinker: 2, detective: 2 } },
      { emoji: '💫', label: 'The Dreamer', desc: 'Imaginative and curious', scores: { dreamer: 3, comfort: 1 } },
    ],
  },
  {
    id: 'pace',
    question: 'Your ideal reading speed?',
    options: [
      { emoji: '⚡', label: 'Page-turner', desc: '"I couldn\'t put it down"', scores: { adventurer: 2, detective: 2, challenger: 1 } },
      { emoji: '🌊', label: 'Slow burn', desc: '"Let me live in this world"', scores: { comfort: 2, thinker: 2, romantic: 1 } },
      { emoji: '🌙', label: 'Cozy', desc: '"I want to stay here forever"', scores: { comfort: 3, dreamer: 1 } },
      { emoji: '🎭', label: 'Emotional journey', desc: '"Make me feel something"', scores: { romantic: 2, challenger: 2, dreamer: 1 } },
    ],
  },
  {
    id: 'setting',
    question: 'Where would you rather be?',
    options: [
      { emoji: '🏰', label: 'Fantasy kingdom', desc: '', scores: { dreamer: 3, adventurer: 1 } },
      { emoji: '🚀', label: 'Another galaxy', desc: '', scores: { thinker: 3, adventurer: 1 } },
      { emoji: '🏙️', label: 'Modern world', desc: '', scores: { comfort: 2, romantic: 2, detective: 1 } },
      { emoji: '🕯️', label: 'Dark mysterious place', desc: '', scores: { shadow: 3, detective: 2 } },
      { emoji: '🌿', label: 'Quiet countryside', desc: '', scores: { comfort: 3, romantic: 1 } },
    ],
  },
  {
    id: 'conflict',
    question: 'What kind of problem interests you?',
    options: [
      { emoji: '⚔️', label: 'Saving the world', desc: '', scores: { adventurer: 3, dreamer: 1 } },
      { emoji: '🔎', label: 'Uncovering secrets', desc: '', scores: { detective: 3, shadow: 1 } },
      { emoji: '❤️', label: 'Finding love', desc: '', scores: { romantic: 3, comfort: 1 } },
      { emoji: '🌱', label: 'Finding yourself', desc: '', scores: { comfort: 2, challenger: 2, dreamer: 1 } },
    ],
  },
  {
    id: 'ending',
    question: 'How should a story end?',
    options: [
      { emoji: '✨', label: 'Happy & hopeful', desc: '', scores: { comfort: 2, romantic: 2, dreamer: 1 } },
      { emoji: '🌧️', label: 'Bittersweet', desc: '', scores: { dreamer: 2, challenger: 2, romantic: 1 } },
      { emoji: '🔥', label: 'Epic and unforgettable', desc: '', scores: { adventurer: 3, challenger: 1 } },
      { emoji: '🤯', label: 'Mind-blowing twist', desc: '', scores: { detective: 2, shadow: 2, thinker: 1 } },
    ],
  },
  {
    id: 'aesthetic',
    question: 'Which cover would you pick from a shelf?',
    isCover: true,
    options: [
      {
        emoji: '🌙',
        label: 'Moonlit fantasy',
        coverBook: 'The Night Circus',
        coverUrl: 'https://covers.openlibrary.org/b/id/8773134-L.jpg',
        gradient: 'linear-gradient(160deg, #1e2d20 0%, #3b5940 50%, #7fa882 100%)',
        scores: { dreamer: 3 },
      },
      {
        emoji: '🕵️',
        label: 'Dark mystery',
        coverBook: 'The Silent Patient',
        coverUrl: 'https://covers.openlibrary.org/b/id/9407338-L.jpg',
        gradient: 'linear-gradient(160deg, #0d1117 0%, #1e2d20 50%, #2d4330 100%)',
        scores: { detective: 3, shadow: 1 },
      },
      {
        emoji: '🌸',
        label: 'Soft romance',
        coverBook: 'Beach Read',
        coverUrl: 'https://covers.openlibrary.org/b/id/9426296-L.jpg',
        gradient: 'linear-gradient(160deg, #4a7050 0%, #a8c4a9 50%, #f0e2ba 100%)',
        scores: { romantic: 3, comfort: 1 },
      },
      {
        emoji: '🚀',
        label: 'Cosmic sci-fi',
        coverBook: 'Dune',
        coverUrl: 'https://covers.openlibrary.org/b/id/11481354-L.jpg',
        gradient: 'linear-gradient(160deg, #0a1628 0%, #1e2d20 50%, #3b5940 100%)',
        scores: { thinker: 3, adventurer: 1 },
      },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = quizQuestions.length;

import type { ReaderTypeId } from './types';

export type PowerId =
  | 'imagination'
  | 'knowledge'
  | 'curiosity'
  | 'empathy'
  | 'communication';

export interface ReadingPower {
  id: PowerId;
  emoji: string;
  title: string;
  displayTitle: string;
  cardBg: string;
  statLabel: string;
  shortDesc: string;
  boostTitle: string;
  boostDesc: string;
  xpBonus: number;
}

export const READING_POWERS: ReadingPower[] = [
  {
    id: 'imagination',
    emoji: '🧠',
    title: 'Imagination',
    displayTitle: 'Boosts Imagination',
    cardBg: '#e8f5e9',
    statLabel: 'Creativity',
    shortDesc: 'Your mind creates new adventures',
    boostTitle: 'Imagination Level +1 ⭐',
    boostDesc: 'Books help you create new worlds and ideas.',
    xpBonus: 10,
  },
  {
    id: 'knowledge',
    emoji: '💡',
    title: 'Knowledge',
    displayTitle: 'Builds Knowledge',
    cardBg: '#fff8e1',
    statLabel: 'Learning',
    shortDesc: 'Learn new ideas every day',
    boostTitle: 'Knowledge Level +1 ⭐',
    boostDesc: 'Stories teach you amazing things about the world.',
    xpBonus: 10,
  },
  {
    id: 'curiosity',
    emoji: '🌎',
    title: 'Curiosity',
    displayTitle: 'Expands Your World',
    cardBg: '#e3f2fd',
    statLabel: 'Exploration',
    shortDesc: 'Explore different places',
    boostTitle: 'Curiosity Level +1 ⭐',
    boostDesc: 'Every book opens a door to somewhere new.',
    xpBonus: 10,
  },
  {
    id: 'empathy',
    emoji: '❤️',
    title: 'Empathy',
    displayTitle: 'Grow Empathy',
    cardBg: '#fce4ec',
    statLabel: 'Understanding',
    shortDesc: 'Understand how others feel',
    boostTitle: 'Empathy Level +1 ⭐',
    boostDesc: 'Stories help you walk in someone else\'s shoes.',
    xpBonus: 10,
  },
  {
    id: 'communication',
    emoji: '🗣️',
    title: 'Communication',
    displayTitle: 'Improves Communication',
    cardBg: '#f3e5f5',
    statLabel: 'Expression',
    shortDesc: 'Express yourself with confidence',
    boostTitle: 'Communication Level +1 ⭐',
    boostDesc: 'Reading gives you words to share your ideas.',
    xpBonus: 10,
  },
];

export type PowerLevels = Record<PowerId, number>;

const BASE_LEVELS: PowerLevels = {
  imagination: 1,
  knowledge: 1,
  curiosity: 1,
  empathy: 1,
  communication: 1,
};

const TYPE_POWER_BOOSTS: Record<ReaderTypeId, Partial<PowerLevels>> = {
  dreamer: { imagination: 3, empathy: 2, curiosity: 2 },
  adventurer: { curiosity: 3, imagination: 2, knowledge: 2 },
  detective: { knowledge: 3, communication: 2, curiosity: 2 },
  romantic: { empathy: 3, communication: 2, imagination: 2 },
  comfort: { empathy: 3, knowledge: 1, communication: 2 },
  thinker: { knowledge: 3, curiosity: 2, imagination: 2 },
  shadow: { imagination: 2, empathy: 2, curiosity: 3 },
  challenger: { communication: 3, empathy: 2, knowledge: 2 },
};

export function getPowerLevels(typeId?: ReaderTypeId | null): PowerLevels {
  if (!typeId) return { ...BASE_LEVELS };
  const boosts = TYPE_POWER_BOOSTS[typeId] ?? {};
  return { ...BASE_LEVELS, ...boosts };
}

export function levelToPlus(level: number): string {
  if (level >= 3) return '+++';
  if (level >= 2) return '++';
  return '+';
}

export function levelToStars(level: number): string {
  return '⭐'.repeat(Math.min(4, level));
}

export function getTopPowers(typeId: ReaderTypeId, count = 2): { power: ReadingPower; level: number }[] {
  const levels = getPowerLevels(typeId);
  return READING_POWERS
    .map((power) => ({ power, level: levels[power.id] }))
    .sort((a, b) => b.level - a.level)
    .slice(0, count);
}

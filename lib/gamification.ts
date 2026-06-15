export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  emoji: string;
  task: string;
  rewardBadge: string;
  rewardXp: number;
  genre: string;
}

export interface SideQuest {
  id: string;
  title: string;
  emoji: string;
  task: string;
  rewardBadge: string;
  rewardXp: number;
  /** Genre filter ids from lib/search-genres.ts */
  searchGenres: string[];
}

export interface MilestoneQuest {
  id: string;
  badgeId: string;
  title: string;
  emoji: string;
  task: string;
  rewardXp: number;
}

/** Milestone quests — sync from account progress or complete in-app */
export const MILESTONE_QUESTS: MilestoneQuest[] = [
  {
    id: 'story-explorer',
    badgeId: 'story-explorer',
    title: 'Story Explorer',
    emoji: '✨',
    task: 'Complete the reader quiz to discover your reader type',
    rewardXp: 50,
  },
  {
    id: 'first-review',
    badgeId: 'first-review',
    title: 'First Review',
    emoji: '📝',
    task: 'Write your first book review',
    rewardXp: 30,
  },
  {
    id: 'collection-starter',
    badgeId: 'collection-starter',
    title: 'Collection Curator',
    emoji: '📚',
    task: 'Save a book to your collection',
    rewardXp: 25,
  },
];

export const BADGES: Badge[] = [
  { id: 'first-review', name: 'First Review', emoji: '📝', description: 'Wrote your first book review' },
  { id: 'story-explorer', name: 'Story Explorer', emoji: '🏅', description: 'Discovered your reader type' },
  { id: 'collection-starter', name: 'Collection Curator', emoji: '📚', description: 'Saved your first book to a collection' },
  { id: 'seven-day', name: '7 Day Reader', emoji: '🏅', description: 'Read 7 days in a row' },
  { id: 'fantasy-quest', name: 'Fantasy Finder', emoji: '🐉', description: 'Searched for fantasy books' },
  { id: 'mystery-quest', name: 'Mystery Hunter', emoji: '🔍', description: 'Searched for mystery books' },
  { id: 'scifi-quest', name: 'Star Explorer', emoji: '🚀', description: 'Searched for sci-fi books' },
  { id: 'adventure-quest', name: 'Trail Blazer', emoji: '🗺️', description: 'Searched for adventure books' },
  { id: 'horror-quest', name: 'Brave Soul', emoji: '👻', description: 'Searched for spooky books' },
  { id: 'humor-quest', name: 'Giggle Seeker', emoji: '😂', description: 'Searched for funny books' },
  { id: 'quest-master', name: 'Quest Master', emoji: '🎯', description: 'Finished 5 reading quests' },
];

/** Genre search quests — complete by searching with the matching genre filter in Explore */
export const SIDE_QUESTS: SideQuest[] = [
  {
    id: 'fantasy-quest',
    title: 'The Fantasy Quest',
    emoji: '🐉',
    task: 'Search for a fantasy book in Explore',
    rewardBadge: 'fantasy-quest',
    rewardXp: 100,
    searchGenres: ['fantasy'],
  },
  {
    id: 'mystery-quest',
    title: 'The Mystery Mission',
    emoji: '🔍',
    task: 'Search for a mystery book in Explore',
    rewardBadge: 'mystery-quest',
    rewardXp: 75,
    searchGenres: ['mystery'],
  },
  {
    id: 'scifi-quest',
    title: 'Star Explorer',
    emoji: '🚀',
    task: 'Search for a sci-fi book in Explore',
    rewardBadge: 'scifi-quest',
    rewardXp: 75,
    searchGenres: ['science-fiction'],
  },
  {
    id: 'adventure-quest',
    title: 'The Adventure Hunt',
    emoji: '🗺️',
    task: 'Search for an adventure book in Explore',
    rewardBadge: 'adventure-quest',
    rewardXp: 75,
    searchGenres: ['adventure'],
  },
  {
    id: 'horror-quest',
    title: 'Spooky Stories',
    emoji: '👻',
    task: 'Search for a spooky book in Explore',
    rewardBadge: 'horror-quest',
    rewardXp: 75,
    searchGenres: ['horror'],
  },
  {
    id: 'humor-quest',
    title: 'Laugh Out Loud',
    emoji: '😂',
    task: 'Search for a funny book in Explore',
    rewardBadge: 'humor-quest',
    rewardXp: 50,
    searchGenres: ['humor'],
  },
];

/** @deprecated Use SIDE_QUESTS */
export const WEEKLY_CHALLENGE = SIDE_QUESTS[0];

export type XpSource =
  | 'reader-quiz'
  | 'start-book'
  | 'book-review'
  | 'collection'
  | 'daily-goal'
  | 'reading-quest'
  | 'weekly-challenge';

export interface XpLogEntry {
  id: string;
  amount: number;
  source: XpSource;
  label: string;
  earnedAt: string;
}

export interface DailyReadingEntry {
  id: string;
  date: string;
  bookTitle: string;
  pages: number;
  summary: string;
  loggedAt: string;
}

export interface DailyReadingLogInput {
  bookTitle: string;
  pages: number;
  summary: string;
}

export interface JourneyState {
  xp: number;
  xpLog: XpLogEntry[];
  booksRead: number;
  streak: number;
  lastReadDate: string | null;
  dailyPages: number;
  dailyGoal: number;
  dailyLogs: DailyReadingEntry[];
  earnedBadges: string[];
  questsCompleted: number;
}

export const DEFAULT_JOURNEY: JourneyState = {
  xp: 0,
  xpLog: [],
  booksRead: 0,
  streak: 0,
  lastReadDate: null,
  dailyPages: 0,
  dailyGoal: 10,
  dailyLogs: [],
  earnedBadges: [],
  questsCompleted: 0,
};

export const XP_PER_LEVEL = 100;
export const MAX_LEVEL = 99;

export const JOURNEY_STORAGE_KEY = 'bookmatch-journey';

export function levelFromXp(xp: number): number {
  return Math.min(MAX_LEVEL, Math.floor(xp / XP_PER_LEVEL) + 1);
}

export function xpProgressInLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpToNextLevel(xp: number): number {
  if (levelFromXp(xp) >= MAX_LEVEL) return 0;
  const progress = xpProgressInLevel(xp);
  return progress === 0 && xp > 0 ? XP_PER_LEVEL : XP_PER_LEVEL - progress;
}

export function xpProgressPercent(xp: number): number {
  if (levelFromXp(xp) >= MAX_LEVEL) return 100;
  return xpProgressInLevel(xp);
}

export function hasXpSource(state: JourneyState, source: XpSource): boolean {
  return (state.xpLog ?? []).some((entry) => entry.source === source);
}

export function hasDailyGoalXpToday(state: JourneyState, date = todayKey()): boolean {
  return (state.xpLog ?? []).some(
    (entry) => entry.source === 'daily-goal' && entry.earnedAt.startsWith(date)
  );
}

export function awardXp(
  state: JourneyState,
  amount: number,
  source: XpSource,
  label: string,
  options?: { once?: boolean }
): JourneyState {
  if (amount <= 0) return state;
  if (options?.once && hasXpSource(state, source)) return state;

  const entry: XpLogEntry = {
    id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    amount,
    source,
    label,
    earnedAt: new Date().toISOString(),
  };

  return {
    ...state,
    xp: state.xp + amount,
    xpLog: [entry, ...(state.xpLog ?? [])].slice(0, 50),
  };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function hasLoggedReadingToday(state: JourneyState, date = todayKey()): boolean {
  return state.lastReadDate === date;
}

export function getTodayReadingLog(state: JourneyState, date = todayKey()): DailyReadingEntry | null {
  return (state.dailyLogs ?? []).find((entry) => entry.date === date) ?? null;
}

export function recordDailyReading(state: JourneyState, log: DailyReadingLogInput): JourneyState {
  const today = todayKey();
  if (hasLoggedReadingToday(state, today)) return state;

  const pages = Math.max(1, Math.min(9999, Math.round(log.pages)));
  const entry: DailyReadingEntry = {
    id: `daily-${today}-${Date.now()}`,
    date: today,
    bookTitle: log.bookTitle.trim(),
    pages,
    summary: log.summary.trim(),
    loggedAt: new Date().toISOString(),
  };

  let next = addDailyPages(
    {
      ...state,
      dailyLogs: [entry, ...(state.dailyLogs ?? [])].slice(0, 30),
    },
    pages
  );

  const continued = state.lastReadDate === yesterdayKey();
  next = {
    ...next,
    streak: continued ? state.streak + 1 : 1,
    lastReadDate: today,
  };

  if (next.streak >= 7) {
    next = awardBadge(next, 'seven-day');
  }

  return next;
}

export function addDailyPages(state: JourneyState, pages: number): JourneyState {
  const next = { ...state, dailyPages: Math.min(state.dailyGoal, state.dailyPages + pages) };
  if (next.dailyPages >= next.dailyGoal && state.dailyPages < state.dailyGoal) {
    const withQuest = { ...next, questsCompleted: next.questsCompleted + 1 };
    if (hasDailyGoalXpToday(state)) return withQuest;
    return awardXp(withQuest, 20, 'daily-goal', 'Daily reading goal reached');
  }
  return next;
}

export function awardBadge(state: JourneyState, badgeId: string): JourneyState {
  if (state.earnedBadges.includes(badgeId)) return state;
  return { ...state, earnedBadges: [...state.earnedBadges, badgeId] };
}

export function recordReaderTypeDiscovered(state: JourneyState): JourneyState {
  let next = awardBadge(state, 'story-explorer');
  return awardXp(next, 50, 'reader-quiz', 'Completed reader quiz', { once: true });
}

export function recordBookReviewed(state: JourneyState): JourneyState {
  let next = state;
  const isFirst = !next.earnedBadges.includes('first-review');
  if (isFirst) {
    next = awardBadge(next, 'first-review');
    next = awardXp(next, 30, 'book-review', 'First review written');
  } else {
    next = awardXp(next, 15, 'book-review', 'Reviewed a book');
  }
  return { ...next, booksRead: next.booksRead + 1 };
}

export function recordBookSavedToCollection(state: JourneyState): JourneyState {
  if (state.earnedBadges.includes('collection-starter')) return state;
  let next = awardBadge(state, 'collection-starter');
  return awardXp(next, 25, 'collection', 'Saved first book to collection', { once: true });
}

export interface JourneyProgress {
  hasReaderType: boolean;
  collectionCount: number;
  reviewCount: number;
}

/** Retroactively unlock badges from saved account progress (quiz, collection, reviews). */
export function syncJourneyProgress(state: JourneyState, progress: JourneyProgress): JourneyState {
  let next = migrateFirstBookBadge(state);

  if (progress.hasReaderType) {
    next = recordReaderTypeDiscovered(next);
  }
  if (progress.collectionCount > 0) {
    next = recordBookSavedToCollection(next);
  }
  if (progress.reviewCount > 0) {
    if (!next.earnedBadges.includes('first-review')) {
      next = awardBadge(next, 'first-review');
      if (!hasXpSource(next, 'book-review') && !hasXpSource(next, 'start-book')) {
        next = awardXp(next, 30, 'book-review', 'First review written');
      }
    }
    if (progress.reviewCount > next.booksRead) {
      next = { ...next, booksRead: progress.reviewCount };
    }
  }
  return next;
}

export function migrateFirstBookBadge(state: JourneyState): JourneyState {
  if (!state.earnedBadges.includes('first-book')) return state;
  const withoutLegacy = state.earnedBadges.filter((id) => id !== 'first-book');
  const earnedBadges = withoutLegacy.includes('first-review')
    ? withoutLegacy
    : [...withoutLegacy, 'first-review'];
  return { ...state, earnedBadges };
}

export function recordReadingQuestCompleted(state: JourneyState): JourneyState {
  return awardXp(state, 100, 'reading-quest', '10-book Reading Quest completed', { once: true });
}

export function recordSideQuestCompleted(state: JourneyState, quest: SideQuest): JourneyState {
  if (state.earnedBadges.includes(quest.rewardBadge)) return state;
  let next = awardBadge(state, quest.rewardBadge);
  next = { ...next, questsCompleted: next.questsCompleted + 1 };
  return awardXp(next, quest.rewardXp, 'weekly-challenge', `Completed: ${quest.title}`);
}

export function completeSideQuestsForSearch(
  state: JourneyState,
  search: { genres: string[] }
): JourneyState {
  let next = state;
  for (const quest of SIDE_QUESTS) {
    if (quest.searchGenres.some((g) => search.genres.includes(g))) {
      next = recordSideQuestCompleted(next, quest);
    }
  }
  return next;
}

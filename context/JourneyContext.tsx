'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_JOURNEY,
  JOURNEY_STORAGE_KEY,
  type JourneyProgress,
  type JourneyState,
  levelFromXp,
  migrateFirstBookBadge,
  recordBookReviewed,
  recordBookSavedToCollection,
  recordReaderTypeDiscovered,
  recordReadingQuestCompleted,
  recordDailyReading,
  completeSideQuestsForSearch,
  syncJourneyProgress,
  todayKey,
  yesterdayKey,
  type DailyReadingLogInput,
} from '@/lib/gamification';

interface JourneyContextValue {
  journey: JourneyState;
  level: number;
  onReaderTypeDiscovered: () => void;
  onReadingQuestCompleted: () => void;
  onBookReviewed: () => void;
  onBookSavedToCollection: () => void;
  syncProgress: (progress: JourneyProgress) => void;
  completeSideQuestsForSearch: (search: { genres: string[] }) => void;
  logDailyReading: (log: DailyReadingLogInput) => boolean;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

function normalizeJourney(parsed: Partial<JourneyState>): JourneyState {
  const base: JourneyState = {
    ...DEFAULT_JOURNEY,
    ...parsed,
    xpLog: parsed.xpLog ?? [],
    earnedBadges: parsed.earnedBadges ?? [],
    dailyLogs: parsed.dailyLogs ?? [],
  };
  return migrateFirstBookBadge(base);
}

function loadJourney(): JourneyState {
  if (typeof window === 'undefined') return { ...DEFAULT_JOURNEY };
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_JOURNEY };
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    const today = todayKey();
    const base = normalizeJourney(parsed);
    if (parsed.lastReadDate !== today) {
      return {
        ...base,
        dailyPages: 0,
        streak: parsed.lastReadDate === yesterdayKey() ? (parsed.streak ?? 0) : 0,
      };
    }
    return base;
  } catch {
    return { ...DEFAULT_JOURNEY };
  }
}

function saveJourney(state: JourneyState) {
  localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(state));
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journey, setJourney] = useState<JourneyState>(DEFAULT_JOURNEY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setJourney(loadJourney());
    setReady(true);
  }, []);

  const persist = useCallback((updater: (prev: JourneyState) => JourneyState) => {
    setJourney((prev) => {
      const next = updater(prev);
      saveJourney(next);
      return next;
    });
  }, []);

  const onReaderTypeDiscovered = useCallback(() => {
    persist((prev) => recordReaderTypeDiscovered(prev));
  }, [persist]);

  const onReadingQuestCompleted = useCallback(() => {
    persist((prev) => recordReadingQuestCompleted(prev));
  }, [persist]);

  const onBookReviewed = useCallback(() => {
    persist((prev) => recordBookReviewed(prev));
  }, [persist]);

  const onBookSavedToCollection = useCallback(() => {
    persist((prev) => recordBookSavedToCollection(prev));
  }, [persist]);

  const syncProgress = useCallback(
    (progress: JourneyProgress) => {
      persist((prev) => syncJourneyProgress(prev, progress));
    },
    [persist]
  );

  const logDailyReading = useCallback(
    (log: DailyReadingLogInput): boolean => {
      let accepted = false;
      persist((prev) => {
        const next = recordDailyReading(prev, log);
        accepted = next !== prev;
        return next;
      });
      return accepted;
    },
    [persist]
  );

  const completeSideQuestsForSearchHandler = useCallback(
    (search: { genres: string[] }) => {
      if (search.genres.length === 0) return;
      persist((prev) => completeSideQuestsForSearch(prev, search));
    },
    [persist]
  );

  if (!ready) {
    return (
      <JourneyContext.Provider
        value={{
          journey: DEFAULT_JOURNEY,
          level: 1,
          onReaderTypeDiscovered: () => {},
          onReadingQuestCompleted: () => {},
          onBookReviewed: () => {},
          onBookSavedToCollection: () => {},
          syncProgress: () => {},
          completeSideQuestsForSearch: () => {},
          logDailyReading: () => false,
        }}
      >
        {children}
      </JourneyContext.Provider>
    );
  }

  return (
    <JourneyContext.Provider
      value={{
        journey,
        level: levelFromXp(journey.xp),
        onReaderTypeDiscovered,
        onReadingQuestCompleted,
        onBookReviewed,
        onBookSavedToCollection,
        syncProgress,
        completeSideQuestsForSearch: completeSideQuestsForSearchHandler,
        logDailyReading,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error('useJourney must be used within JourneyProvider');
  return ctx;
}

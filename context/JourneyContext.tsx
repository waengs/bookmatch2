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
  type JourneyState,
  addDailyPages,
  awardBadge,
  levelFromXp,
  recordBookStarted,
  recordBookReviewed,
  recordReaderTypeDiscovered,
  recordReadingQuestCompleted,
  todayKey,
} from '@/lib/gamification';

interface JourneyContextValue {
  journey: JourneyState;
  level: number;
  onReaderTypeDiscovered: () => void;
  onReadingQuestCompleted: () => void;
  onBookReviewed: () => void;
  logPages: (pages: number) => void;
  startBook: () => void;
}

const JourneyContext = createContext<JourneyContextValue | null>(null);

function normalizeJourney(parsed: Partial<JourneyState>): JourneyState {
  return {
    ...DEFAULT_JOURNEY,
    ...parsed,
    xpLog: parsed.xpLog ?? [],
  };
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
        dailyPages: parsed.lastReadDate === getYesterday() ? (parsed.dailyPages ?? 0) : 0,
        streak:
          parsed.lastReadDate === getYesterday()
            ? (parsed.streak ?? 0)
            : parsed.lastReadDate === today
              ? (parsed.streak ?? 0)
              : 0,
      };
    }
    return base;
  } catch {
    return { ...DEFAULT_JOURNEY };
  }
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
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

  const logPages = useCallback(
    (pages: number) => {
      persist((prev) => {
        let next = addDailyPages(prev, pages);
        const today = todayKey();
        if (prev.lastReadDate !== today) {
          const continued = prev.lastReadDate === getYesterday();
          next = {
            ...next,
            streak: continued ? next.streak + 1 : 1,
            lastReadDate: today,
          };
          if (next.streak >= 7) next = awardBadge(next, 'seven-day');
        }
        return next;
      });
    },
    [persist]
  );

  const startBook = useCallback(() => {
    persist((prev) => recordBookStarted(prev));
  }, [persist]);

  if (!ready) {
    return (
      <JourneyContext.Provider
        value={{
          journey: DEFAULT_JOURNEY,
          level: 1,
          onReaderTypeDiscovered: () => {},
          onReadingQuestCompleted: () => {},
          onBookReviewed: () => {},
          logPages: () => {},
          startBook: () => {},
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
        logPages,
        startBook,
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

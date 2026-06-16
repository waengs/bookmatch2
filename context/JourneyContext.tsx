'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import {
  DEFAULT_JOURNEY,
  JOURNEY_STORAGE_KEY,
  type JourneyProgress,
  type JourneyState,
  levelFromXp,
  mergeJourneyStates,
  normalizeStoredJourney,
  recordBookReviewed,
  recordBookSavedToCollection,
  recordReaderTypeDiscovered,
  recordReadingQuestCompleted,
  recordDailyReading,
  completeSideQuestsForSearch,
  syncJourneyProgress,
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

function loadLocalJourney(): JourneyState {
  if (typeof window === 'undefined') return { ...DEFAULT_JOURNEY };
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_JOURNEY };
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    return normalizeStoredJourney(parsed);
  } catch {
    return { ...DEFAULT_JOURNEY };
  }
}

function saveLocalJourney(state: JourneyState) {
  localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(state));
}

async function saveRemoteJourney(journey: JourneyState) {
  await fetch('/api/user/journey', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ journey }),
  });
}

export function JourneyProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [journey, setJourney] = useState<JourneyState>(DEFAULT_JOURNEY);
  const [ready, setReady] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedForUserRef = useRef<string | null>(null);

  useEffect(() => {
    setJourney(loadLocalJourney());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || status === 'loading') return;

    if (!userId) {
      syncedForUserRef.current = null;
      return;
    }

    if (syncedForUserRef.current === userId) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/user/journey');
        if (cancelled) return;

        if (res.ok) {
          const data = (await res.json()) as { journey?: JourneyState | null };
          setJourney((current) => {
            const local = normalizeStoredJourney(current);
            const remote = data.journey ? normalizeStoredJourney(data.journey) : null;
            const merged = remote ? mergeJourneyStates(local, remote) : local;
            saveLocalJourney(merged);
            return merged;
          });
        }
      } catch {
        /* keep local journey */
      } finally {
        if (!cancelled) syncedForUserRef.current = userId;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, status, userId]);

  const persist = useCallback(
    (updater: (prev: JourneyState) => JourneyState, options?: { immediate?: boolean }) => {
      setJourney((prev) => {
        const next = normalizeStoredJourney(updater(prev));
        saveLocalJourney(next);

        if (userId) {
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          if (options?.immediate) {
            saveRemoteJourney(next).catch(() => {});
          } else {
            saveTimerRef.current = setTimeout(() => {
              saveRemoteJourney(next).catch(() => {});
            }, 400);
          }
        }

        return next;
      });
    },
    [userId]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
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
      persist(
        (prev) => {
          const next = recordDailyReading(prev, log);
          accepted = next !== prev;
          return next;
        },
        { immediate: true }
      );
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

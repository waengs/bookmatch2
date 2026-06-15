'use client';

import { useJourney } from '@/context/JourneyContext';
import type { XpSource } from '@/lib/gamification';

const SOURCE_EMOJI: Record<XpSource, string> = {
  'reader-quiz': '✨',
  'start-book': '📖',
  'book-review': '📝',
  'collection': '📚',
  'daily-goal': '🎯',
  'reading-quest': '🏆',
  'weekly-challenge': '⭐',
};

function formatEarnedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface XpHistoryProps {
  limit?: number;
  title?: string;
}

export default function XpHistory({ limit = 8, title = 'Where your XP came from' }: XpHistoryProps) {
  const { journey } = useJourney();
  const entries = (journey.xpLog ?? []).slice(0, limit);

  if (entries.length === 0) {
    return (
      <div className="xp-history">
        <h3 className="xp-history-title">{title}</h3>
        <p className="xp-history-empty">
          No XP yet — complete the reader quiz, save a book, or finish quests to earn your first points!
        </p>
      </div>
    );
  }

  return (
    <div className="xp-history">
      <h3 className="xp-history-title">{title}</h3>
      <ul className="xp-history-list">
        {entries.map((entry) => (
          <li key={entry.id} className="xp-history-item">
            <span className="xp-history-icon" aria-hidden="true">
              {SOURCE_EMOJI[entry.source]}
            </span>
            <div className="xp-history-body">
              <span className="xp-history-label">{entry.label}</span>
              <span className="xp-history-date">{formatEarnedAt(entry.earnedAt)}</span>
            </div>
            <span className="xp-history-amount">+{entry.amount} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

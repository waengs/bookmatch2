'use client';

import { useJourney } from '@/context/JourneyContext';
import {
  xpProgressInLevel,
  xpProgressPercent,
  xpToNextLevel,
  XP_PER_LEVEL,
  MAX_LEVEL,
} from '@/lib/gamification';

interface XpProgressProps {
  compact?: boolean;
}

export default function XpProgress({ compact = false }: XpProgressProps) {
  const { journey, level } = useJourney();
  const atMaxLevel = level >= MAX_LEVEL;
  const progress = xpProgressInLevel(journey.xp);
  const toNext = xpToNextLevel(journey.xp);
  const nextLevel = Math.min(level + 1, MAX_LEVEL);

  if (compact) {
    return (
      <div className="xp-progress xp-progress--compact">
        <div className="xp-progress-compact-top">
          <span className="xp-progress-level">Level {level}</span>
          <span className="xp-progress-fraction">
            {atMaxLevel ? 'Max level' : `${progress}/${XP_PER_LEVEL} XP`}
          </span>
        </div>
        <div className="xp-bar-wrap xp-bar-wrap--compact">
          <div className="xp-bar-fill" style={{ width: `${xpProgressPercent(journey.xp)}%` }} />
        </div>
        {!atMaxLevel && (
          <p className="xp-bar-label xp-bar-label--compact">
            {toNext} XP to Level {nextLevel}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="xp-summary">
      <div className="xp-level-ring">
        <span className="xp-level-num">{level}</span>
      </div>
      <div className="xp-summary-body">
        <div className="xp-summary-title">Level {level} Reader</div>
        <div className="xp-summary-xp">
          {journey.xp} XP total · {progress}/{XP_PER_LEVEL} this level
        </div>
        <div className="xp-bar-wrap">
          <div className="xp-bar-fill" style={{ width: `${xpProgressPercent(journey.xp)}%` }} />
        </div>
        <div className="xp-bar-label">
          {atMaxLevel
            ? 'You reached the highest reader level!'
            : `${toNext} XP to reach Level ${nextLevel}`}
        </div>
      </div>
    </div>
  );
}

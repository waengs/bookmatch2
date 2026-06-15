'use client';

import { useBookMatch } from '@/context/BookMatchContext';
import { useJourney } from '@/context/JourneyContext';
import { WEEKLY_CHALLENGE, BADGES } from '@/lib/gamification';
import ReaderQuest from '@/components/ReaderQuest';

interface QuestsPanelProps {
  onFindFantasyBook?: () => void;
}

export default function QuestsPanel({ onFindFantasyBook }: QuestsPanelProps) {
  const { readerType } = useBookMatch();
  const { journey } = useJourney();
  const challenge = WEEKLY_CHALLENGE;
  const hasFantasyBadge = journey.earnedBadges.includes(challenge.rewardBadge);

  return (
    <div className="panel quests-panel">
      <h1 className="panel-title">🎯 Your Quests</h1>
      <p className="panel-sub">Complete quests to earn XP and unlock badges!</p>

      <ReaderQuest />

      <div className="challenge-card">
        <div className="challenge-badge">Weekly Challenge</div>
        <h2 className="challenge-title">{challenge.emoji} {challenge.title}</h2>
        <p className="challenge-task">{challenge.task}</p>
        <div className="challenge-rewards">
          <span>Reward:</span>
          <span className="challenge-reward-item">🌟 {BADGES.find((b) => b.id === challenge.rewardBadge)?.name ?? 'Badge'}</span>
          <span className="challenge-reward-item">+{challenge.rewardXp} XP</span>
        </div>
        {hasFantasyBadge ? (
          <div className="challenge-done">Challenge complete! 🎉</div>
        ) : (
          <button
            type="button"
            className="cta-btn cta-btn--secondary"
            onClick={() => onFindFantasyBook?.()}
          >
            {readerType ? 'Find a fantasy book →' : 'Discover your type first ✨'}
          </button>
        )}
      </div>

      <div className="mini-stats">
        <div className="mini-stat">
          <span className="mini-stat-val">{journey.questsCompleted}</span>
          <span className="mini-stat-label">Quests done</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-val">{journey.streak} 🔥</span>
          <span className="mini-stat-label">Day streak</span>
        </div>
      </div>
    </div>
  );
}

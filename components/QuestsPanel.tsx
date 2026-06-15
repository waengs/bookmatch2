'use client';

import { useBookMatch } from '@/context/BookMatchContext';
import { useJourney } from '@/context/JourneyContext';
import { SIDE_QUESTS, BADGES } from '@/lib/gamification';
import { getSearchGenre } from '@/lib/search-genres';
import ReaderQuest from '@/components/ReaderQuest';

interface QuestsPanelProps {
  onStartQuest?: (genres: string[]) => void;
}

export default function QuestsPanel({ onStartQuest }: QuestsPanelProps) {
  const { readerType, openQuiz } = useBookMatch();
  const { journey } = useJourney();

  return (
    <div className="panel quests-panel">
      <h1 className="panel-title">🎯 Your Quests</h1>
      <p className="panel-sub">Complete quests to earn XP and unlock badges!</p>

      <ReaderQuest />

      <h2 className="side-quests-heading">Genre quests</h2>
      <p className="side-quests-sub">Search in Explore with a genre filter to complete each quest.</p>

      <div className="side-quests-list">
        {SIDE_QUESTS.map((quest) => {
          const done = journey.earnedBadges.includes(quest.rewardBadge);
          const genreLabel = getSearchGenre(quest.searchGenres[0])?.label ?? 'books';

          return (
            <div key={quest.id} className="challenge-card">
              <div className="challenge-badge">Side quest</div>
              <h3 className="challenge-title">{quest.emoji} {quest.title}</h3>
              <p className="challenge-task">{quest.task}</p>
              <div className="challenge-rewards">
                <span>Reward:</span>
                <span className="challenge-reward-item">
                  {BADGES.find((b) => b.id === quest.rewardBadge)?.emoji ?? '🏅'}{' '}
                  {BADGES.find((b) => b.id === quest.rewardBadge)?.name ?? 'Badge'}
                </span>
                <span className="challenge-reward-item">+{quest.rewardXp} XP</span>
              </div>
              {done ? (
                <div className="challenge-done">Quest complete! 🎉</div>
              ) : (
                <button
                  type="button"
                  className="cta-btn cta-btn--secondary"
                  onClick={() => {
                    if (!readerType) {
                      openQuiz();
                      return;
                    }
                    onStartQuest?.(quest.searchGenres);
                  }}
                >
                  {readerType ? `Search ${genreLabel.toLowerCase()} books →` : 'Discover your type first ✨'}
                </button>
              )}
            </div>
          );
        })}
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

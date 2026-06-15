'use client';

import { useBookMatch } from '@/context/BookMatchContext';
import { useJourney } from '@/context/JourneyContext';
import { MILESTONE_QUESTS, SIDE_QUESTS, BADGES } from '@/lib/gamification';
import { getSearchGenre } from '@/lib/search-genres';
import ReaderQuest from '@/components/ReaderQuest';
import DailyReadingLog from '@/components/DailyReadingLog';

interface QuestsPanelProps {
  onStartQuest?: (genres: string[]) => void;
  onBrowseBooks?: () => void;
}

export default function QuestsPanel({ onStartQuest, onBrowseBooks }: QuestsPanelProps) {
  const { readerType, openQuiz } = useBookMatch();
  const { journey } = useJourney();

  const scrollToReadingQuest = () => {
    document.getElementById('section-quest')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="panel quests-panel">
      <h1 className="panel-title">🎯 Your Quests</h1>
      <p className="panel-sub">Complete quests to earn XP and unlock badges!</p>

      <ReaderQuest />

      <DailyReadingLog compact />

      <h2 className="side-quests-heading">Milestone quests</h2>
      <p className="side-quests-sub">Unlock badges as you explore BookMatch.</p>

      <div className="side-quests-list">
        {MILESTONE_QUESTS.map((quest) => {
          const done = journey.earnedBadges.includes(quest.badgeId);
          const badge = BADGES.find((b) => b.id === quest.badgeId);

          return (
            <div key={quest.id} className="challenge-card">
              <div className="challenge-badge">Milestone</div>
              <h3 className="challenge-title">
                {quest.emoji} {quest.title}
              </h3>
              <p className="challenge-task">{quest.task}</p>
              <div className="challenge-rewards">
                <span>Reward:</span>
                <span className="challenge-reward-item">
                  {badge?.emoji ?? '🏅'} {badge?.name ?? 'Badge'}
                </span>
                <span className="challenge-reward-item">+{quest.rewardXp} XP</span>
              </div>
              {done ? (
                <div className="challenge-done">Quest complete! 🎉</div>
              ) : quest.id === 'story-explorer' ? (
                <button type="button" className="cta-btn cta-btn--secondary" onClick={() => openQuiz()}>
                  {readerType ? 'Retake quiz →' : 'Take the reader quiz ✨'}
                </button>
              ) : quest.id === 'first-review' ? (
                <button
                  type="button"
                  className="cta-btn cta-btn--secondary"
                  onClick={scrollToReadingQuest}
                >
                  Review a quest book →
                </button>
              ) : (
                <button
                  type="button"
                  className="cta-btn cta-btn--secondary"
                  onClick={() => onBrowseBooks?.()}
                >
                  Browse books to save →
                </button>
              )}
            </div>
          );
        })}
      </div>

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

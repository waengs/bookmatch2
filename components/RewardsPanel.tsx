'use client';

import { useJourney } from '@/context/JourneyContext';
import { BADGES } from '@/lib/gamification';
import XpProgress from '@/components/XpProgress';
import XpHistory from '@/components/XpHistory';

export default function RewardsPanel() {
  const { journey } = useJourney();

  return (
    <div className="panel rewards-panel">
      <h1 className="panel-title">🏆 Your Rewards</h1>
      <p className="panel-sub">Collect badges as you explore the magical library!</p>

      <XpProgress />
      <XpHistory />

      <h2 className="badges-heading">Badge Collection</h2>
      <div className="badges-grid">
        {BADGES.map((badge) => {
          const earned = journey.earnedBadges.includes(badge.id);
          return (
            <div key={badge.id} className={`badge-card${earned ? ' badge-card--earned' : ' badge-card--locked'}`}>
              <span className="badge-emoji">{earned ? badge.emoji : '🔒'}</span>
              <span className="badge-name">{badge.name}</span>
              <span className="badge-desc">{badge.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useBookMatch } from '@/context/BookMatchContext';
import { useJourney } from '@/context/JourneyContext';
import { BADGES } from '@/lib/gamification';
import { signOutUser } from '@/lib/auth-client';
import ReadingPowersList from '@/components/ReadingPowersList';
import MyCollection from '@/components/MyCollection';
import XpProgress from '@/components/XpProgress';
import XpHistory from '@/components/XpHistory';
import EditProfileModal from '@/components/EditProfileModal';
import DailyReadingLog from '@/components/DailyReadingLog';

export default function MePanel() {
  const { data: session } = useSession();
  const { readerType, openQuiz } = useBookMatch();
  const { journey, level } = useJourney();
  const [editOpen, setEditOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const earnedBadgeList = BADGES.filter((b) => journey.earnedBadges.includes(b.id));
  const displayName = session?.user?.name ?? 'Reader';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    setSigningOut(true);
    await signOutUser();
  }

  return (
    <div className="panel me-panel" id="section-me">
      <div className="me-header">
        <h1 className="panel-title">👤 Your Reading Journey</h1>
      </div>

      {session?.user ? (
        <div className="me-profile-card">
          <div className="me-profile-identity">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="me-profile-avatar"
                unoptimized
              />
            ) : (
              <span className="me-profile-initials">{initials}</span>
            )}
            <div>
              <div className="me-profile-name">{displayName}</div>
              {session.user.email && (
                <div className="me-profile-email">{session.user.email}</div>
              )}
            </div>
          </div>
          <div className="me-profile-actions">
            <button type="button" className="cta-btn cta-btn--outline" onClick={() => setEditOpen(true)}>
              Edit profile
            </button>
            <button
              type="button"
              className="cta-btn cta-btn--primary me-logout-btn"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Signing out…' : 'Log out'}
            </button>
          </div>
        </div>
      ) : (
        <div className="me-profile-card me-profile-card--guest">
          <p className="me-profile-guest-text">Sign in to save books, track XP, and build your collection.</p>
          <Link href="/login" className="cta-btn cta-btn--primary">
            Sign in
          </Link>
        </div>
      )}

      <div className="journey-card">
        {readerType ? (
          <>
            <div className="journey-level">
              Level {level} {readerType.name.replace('The ', '')}
            </div>
            <div className="journey-type-row">
              <span className="journey-type-emoji">{readerType.emoji}</span>
              <span className="journey-type-name">{readerType.adventureTitle}</span>
            </div>
            <p className="journey-tagline">{readerType.kidTagline}</p>
            <ReadingPowersList typeId={readerType.id} />
          </>
        ) : (
          <>
            <div className="journey-level">Level {level} Reader</div>
            <p className="journey-tagline">Discover your reader type to begin your adventure!</p>
            <button type="button" className="cta-btn" onClick={openQuiz}>
              Discover My Reader Type ✨
            </button>
          </>
        )}

        <div className="journey-stats">
          <div className="journey-stat">
            <span className="journey-stat-icon">📚</span>
            <span className="journey-stat-val">Books reviewed: {journey.booksRead}</span>
          </div>
          <div className="journey-stat">
            <span className="journey-stat-icon">🔥</span>
            <span className="journey-stat-val">Streak: {journey.streak} days</span>
          </div>
        </div>

        <XpProgress compact />
        <XpHistory limit={5} />
      </div>

      <DailyReadingLog compact />

      <MyCollection />

      <h2 className="badges-heading">Your Badges</h2>
      {earnedBadgeList.length === 0 ? (
        <p className="me-no-badges">Complete quests to earn your first badge! 🏅</p>
      ) : (
        <div className="me-badges-row">
          {earnedBadgeList.map((b) => (
            <div key={b.id} className="me-badge-pill">
              {b.emoji} {b.name}
            </div>
          ))}
        </div>
      )}

      {readerType && (
        <button type="button" className="cta-btn cta-btn--outline me-retake-quiz-btn" onClick={openQuiz}>
          Retake reader quiz →
        </button>
      )}

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}

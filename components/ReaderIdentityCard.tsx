'use client';

import { useBookMatch } from '@/context/BookMatchContext';
import XpProgress from '@/components/XpProgress';

interface ReaderIdentityCardProps {
  variant?: 'sidebar' | 'header';
  onViewProfile?: () => void;
  onTakeQuiz?: () => void;
}

export default function ReaderIdentityCard({
  variant = 'sidebar',
  onViewProfile,
  onTakeQuiz,
}: ReaderIdentityCardProps) {
  const { readerType, isSignedIn, openQuiz } = useBookMatch();
  const takeQuiz = onTakeQuiz ?? openQuiz;

  if (variant === 'header' && !readerType) return null;
  if (variant === 'sidebar' && readerType) return null;

  const cardClass = `reader-identity-card${
    readerType ? '' : ' reader-identity-card--empty'
  }${variant === 'header' ? ' reader-identity-card--header' : ''}`;

  return (
    <div className={cardClass}>
      <div className="reader-identity-label">Your Reader Identity</div>

      {readerType ? (
        <div className="reader-identity-content">
          <div className="reader-identity-avatar">
            <span>{readerType.emoji}</span>
          </div>
          <div className="reader-identity-body">
            <div className="reader-identity-name">{readerType.adventureTitle}</div>
            <p className="reader-identity-tagline">{readerType.kidTagline}</p>
            {variant === 'sidebar' && (
              <button type="button" className="reader-identity-btn" onClick={onViewProfile}>
                View My Profile
              </button>
            )}
          </div>
          <div className="reader-identity-xp">
            <XpProgress compact />
          </div>
          {variant === 'header' && onViewProfile && (
            <button type="button" className="reader-identity-btn reader-identity-btn--header" onClick={onViewProfile}>
              View profile
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="reader-identity-avatar reader-identity-avatar--empty">✨</div>
          <p className="reader-identity-tagline">
            {isSignedIn ? 'Discover who you are as a reader!' : 'Sign in to take the reader quiz!'}
          </p>
          <button
            type="button"
            className="reader-identity-btn reader-identity-btn--primary"
            onClick={takeQuiz}
          >
            {isSignedIn ? 'Discover My Type ✨' : 'Sign in ✨'}
          </button>
        </>
      )}
    </div>
  );
}

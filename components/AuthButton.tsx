'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { signOutUser } from '@/lib/auth-client';

interface AuthButtonProps {
  showName?: boolean;
  /** Header profile pill — go to Me instead of dropdown */
  onProfileClick?: () => void;
}

export default function AuthButton({ showName = false, onProfileClick }: AuthButtonProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="auth-btn auth-btn--loading" aria-hidden="true" />;
  }

  if (!session?.user) {
    return (
      <Link href="/login" className="auth-btn auth-btn--signin">
        Sign in
      </Link>
    );
  }

  const displayName = session.user.name?.split(' ')[0] ?? 'Reader';
  const initials = displayName.slice(0, 2).toUpperCase();

  const profileButton = (
    <button
      type="button"
      className={`auth-btn auth-btn--user${showName ? ' auth-btn--named' : ''}`}
      aria-label={onProfileClick ? 'Go to your profile' : 'Account menu'}
      onClick={onProfileClick}
    >
      {showName && <span className="auth-display-name">{displayName}</span>}
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt=""
          width={32}
          height={32}
          className="auth-avatar"
          unoptimized
        />
      ) : (
        <span className="auth-initials">{initials}</span>
      )}
    </button>
  );

  if (onProfileClick) {
    return profileButton;
  }

  return (
    <div className="auth-menu">
      {profileButton}
      <div className="auth-dropdown">
        <div className="auth-dropdown-name">{session.user.name ?? displayName}</div>
        {session.user.email && (
          <div className="auth-dropdown-email">{session.user.email}</div>
        )}
        <button type="button" className="auth-dropdown-signout" onClick={signOutUser}>
          Sign out
        </button>
      </div>
    </div>
  );
}

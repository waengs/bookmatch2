import Link from 'next/link';
import { Suspense } from 'react';
import AppLogo from '@/components/AppLogo';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <Link href="/" className="login-back">← Back to BookMatch</Link>
        <AppLogo href="/" className="login-logo" />
        <h1 className="login-heading">Join the adventure</h1>
        <p className="login-sub">
          Create a free account to discover your reader type, save books to your collection, and join the 10-book Reading Quest.
        </p>
        <Suspense fallback={<p className="login-sub">Loading…</p>}>
          <LoginForm />
        </Suspense>
        <p className="login-note">
          Your reader quiz, saved collection, and Reading Quest unlock after you sign in.
        </p>
      </div>
    </div>
  );
}

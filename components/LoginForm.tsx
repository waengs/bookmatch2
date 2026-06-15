'use client';

import { FormEvent, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getFirebaseAuth } from '@/lib/firebase/client';

type AuthMode = 'signin' | 'signup';

function firebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    default:
      return 'Could not sign in. Please try again.';
  }
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const trimmedName = name.trim();

      if (mode === 'signup' && !trimmedName) {
        setError('Please enter your name.');
        return;
      }

      const credential =
        mode === 'signup'
          ? await createUserWithEmailAndPassword(auth, email.trim(), password)
          : await signInWithEmailAndPassword(auth, email.trim(), password);

      if (mode === 'signup') {
        await updateProfile(credential.user, { displayName: trimmedName });
        await credential.user.getIdToken(true);
      }

      const idToken = await credential.user.getIdToken();

      const result = await signIn('firebase', {
        idToken,
        ...(mode === 'signup' ? { name: trimmedName } : {}),
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError('Could not create your session. Please try again.');
        return;
      }

      router.push(result?.url ?? callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setError(firebaseErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="login-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signin'}
          className={`login-tab${mode === 'signin' ? ' login-tab--active' : ''}`}
          onClick={() => { setMode('signin'); setError(null); }}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'signup'}
          className={`login-tab${mode === 'signup' ? ' login-tab--active' : ''}`}
          onClick={() => { setMode('signup'); setError(null); }}
        >
          Create account
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <label className="login-field">
            <span className="login-label">Your name</span>
            <input
              type="text"
              name="name"
              className="login-input"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="What should we call you?"
            />
          </label>
        )}
        <label className="login-field">
          <span className="login-label">Email</span>
          <input
            type="email"
            name="email"
            className="login-input"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </label>
        <label className="login-field">
          <span className="login-label">Password</span>
          <input
            type="password"
            name="password"
            className="login-input"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </label>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="login-submit" disabled={loading}>
          {loading
            ? mode === 'signup'
              ? 'Creating account…'
              : 'Signing in…'
            : mode === 'signup'
              ? 'Create account'
              : 'Sign in'}
        </button>
      </form>
    </>
  );
}

'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { data: session, update } = useSession();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(session?.user?.name ?? '');
      setError(null);
    }
  }, [open, session?.user?.name]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Could not save profile');
      }

      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmed });
      }

      await update({ name: trimmed });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="quiz-overlay active"
      role="dialog"
      aria-modal="true"
      aria-label="Edit profile"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="review-modal edit-profile-modal">
        <button type="button" className="quiz-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <h2 className="review-modal-title">Edit profile</h2>
        {session?.user?.email && (
          <p className="review-modal-book">{session.user.email}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="review-field">
            <span className="review-field-label">Display name</span>
            <input
              type="text"
              className="edit-profile-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              required
            />
          </label>

          {error && <p className="login-error" role="alert">{error}</p>}

          <div className="edit-profile-actions">
            <button type="button" className="cta-btn cta-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="cta-btn cta-btn--primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { signOut } from 'next-auth/react';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';

export async function signOutUser() {
  try {
    await firebaseSignOut(getFirebaseAuth());
  } catch {
    /* session may already be cleared */
  }
  await signOut({ callbackUrl: '/' });
}

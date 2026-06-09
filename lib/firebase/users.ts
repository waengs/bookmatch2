import type { ReaderTypeId } from '@/lib/types';
import { getAdminDb } from './admin';

const USERS = 'users';

export interface UserProfile {
  readerTypeId?: ReaderTypeId;
  email?: string | null;
  name?: string | null;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getAdminDb().collection(USERS).doc(uid).get();
  if (!snap.exists) return null;
  return snap.data() as UserProfile;
}

export async function saveUserReaderType(uid: string, readerTypeId: ReaderTypeId): Promise<void> {
  await getAdminDb().collection(USERS).doc(uid).set(
    { readerTypeId, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function upsertUserProfile(
  uid: string,
  data: { email?: string | null; name?: string | null }
): Promise<void> {
  await getAdminDb().collection(USERS).doc(uid).set(
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}

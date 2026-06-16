import type { JourneyState } from '@/lib/gamification';
import { getAdminDb } from './admin';

const USERS = 'users';

export async function getUserJourney(uid: string): Promise<JourneyState | null> {
  const snap = await getAdminDb().collection(USERS).doc(uid).get();
  if (!snap.exists) return null;
  const journey = snap.data()?.journey;
  if (!journey || typeof journey !== 'object') return null;
  return journey as JourneyState;
}

export async function saveUserJourney(uid: string, journey: JourneyState): Promise<void> {
  await getAdminDb().collection(USERS).doc(uid).set(
    { journey, journeyUpdatedAt: new Date().toISOString() },
    { merge: true }
  );
}

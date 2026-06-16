import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserJourney, saveUserJourney } from '@/lib/firebase/journey';
import { normalizeStoredJourney, type JourneyState } from '@/lib/gamification';

function parseJourney(body: unknown): JourneyState | null {
  if (!body || typeof body !== 'object') return null;
  const payload = body as { journey?: unknown };
  if (!payload.journey || typeof payload.journey !== 'object') return null;
  return normalizeStoredJourney(payload.journey as Partial<JourneyState>);
}

export async function GET() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const journey = await getUserJourney(uid);
    return NextResponse.json({
      journey: journey ? normalizeStoredJourney(journey) : null,
    });
  } catch (err) {
    console.error('[journey GET]', err);
    return NextResponse.json({ error: 'Failed to load journey' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const journey = parseJourney(body);
  if (!journey) {
    return NextResponse.json({ error: 'Invalid journey payload' }, { status: 400 });
  }

  try {
    await saveUserJourney(uid, journey);
    return NextResponse.json({ ok: true, journey });
  } catch (err) {
    console.error('[journey PUT]', err);
    return NextResponse.json({ error: 'Failed to save journey' }, { status: 500 });
  }
}

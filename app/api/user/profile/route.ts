import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { upsertUserProfile } from '@/lib/firebase/users';

export async function PATCH(request: Request) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length > 60) {
    return NextResponse.json({ error: 'Name must be 1–60 characters' }, { status: 400 });
  }

  try {
    await upsertUserProfile(uid, { name });
    return NextResponse.json({ ok: true, name });
  } catch (err) {
    console.error('[profile]', err);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveUserReaderType, getUserProfile } from '@/lib/firebase/users';
import { getReaderType } from '@/lib/reader-types';
import type { ReaderTypeId } from '@/lib/types';

function isValidReaderTypeId(id: string): id is ReaderTypeId {
  return getReaderType(id).id === id;
}

export async function GET() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(uid);
    const readerTypeId = profile?.readerTypeId;
    if (readerTypeId && !isValidReaderTypeId(readerTypeId)) {
      return NextResponse.json({ readerTypeId: null });
    }
    return NextResponse.json({ readerTypeId: readerTypeId ?? null });
  } catch (err) {
    console.error('[reader-type GET]', err);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { readerTypeId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { readerTypeId } = body;
  if (!readerTypeId || !isValidReaderTypeId(readerTypeId)) {
    return NextResponse.json({ error: 'Invalid reader type' }, { status: 400 });
  }

  try {
    await saveUserReaderType(uid, readerTypeId);
    return NextResponse.json({ ok: true, readerTypeId });
  } catch (err) {
    console.error('[reader-type]', err);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

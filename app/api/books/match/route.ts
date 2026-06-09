import { NextRequest, NextResponse } from 'next/server';
import { matchBooksForReaderType } from '@/lib/book-apis/match-books';
import { readerTypes } from '@/lib/reader-types';
import type { ReaderTypeId } from '@/lib/types';

export async function GET(request: NextRequest) {
  const typeId = request.nextUrl.searchParams.get('type') as ReaderTypeId | null;
  const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10), 24);

  if (!typeId || !(typeId in readerTypes)) {
    return NextResponse.json(
      { error: 'Invalid reader type. Use ?type=dreamer|adventurer|...' },
      { status: 400 }
    );
  }

  try {
    const { books, source } = await matchBooksForReaderType(typeId, limit);

    return NextResponse.json({
      books,
      source,
      readerType: typeId,
    });
  } catch (err) {
    console.error('Book match error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch book matches' },
      { status: 500 }
    );
  }
}

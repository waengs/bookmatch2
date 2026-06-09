import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '@/lib/book-apis/search-books';
import { getSearchGenre } from '@/lib/search-genres';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get('q')?.trim() ?? '';
  const genresParam = params.get('genres') ?? '';
  const limit = Math.min(parseInt(params.get('limit') ?? '20', 10), 24);

  const genres = genresParam
    .split(',')
    .map((g) => g.trim())
    .filter((g) => getSearchGenre(g));

  if (!query && genres.length === 0) {
    return NextResponse.json(
      { error: 'Provide a search query (?q=) and/or genre filters (?genres=fantasy,adventure)' },
      { status: 400 }
    );
  }

  try {
    const { books, source } = await searchBooks({ query, genres, limit });
    return NextResponse.json({ books, source, query, genres });
  } catch (err) {
    console.error('Book search error:', err);
    return NextResponse.json({ error: 'Failed to search books' }, { status: 500 });
  }
}

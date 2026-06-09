import { NextRequest, NextResponse } from 'next/server';
import { googleBooksSearchUrl } from '@/lib/book-link';
import { resolveGoogleBookLink } from '@/lib/book-apis/google-books';

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title')?.trim();
  const author = request.nextUrl.searchParams.get('author')?.trim();

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  try {
    const resolved = await resolveGoogleBookLink(title, author ?? '');
    const url = resolved?.externalUrl ?? googleBooksSearchUrl(title, author ?? '');
    return NextResponse.json({ url, resolved: !!resolved });
  } catch (err) {
    console.error('[books/link]', err);
    return NextResponse.json({
      url: googleBooksSearchUrl(title, author ?? ''),
      resolved: false,
    });
  }
}

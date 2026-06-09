import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  addBookToCollection,
  getUserCollection,
  removeBookFromCollection,
  submitCollectionReview,
  type SavedBook,
} from '@/lib/firebase/collection';
import { getReadingQuest, submitQuestReview } from '@/lib/firebase/reading-quest';
import { enrichBookWithPrice, enrichBooksWithPrices } from '@/lib/book-apis/enrich-prices';
import { collectionDocId } from '@/lib/book-id';
import {
  countReviewWords,
  isQuestBookReviewed,
  isValidReview,
  MIN_REVIEW_WORDS,
} from '@/lib/reading-quest';
import { bookKey, hasPrice } from '@/lib/price';
import type { Book } from '@/lib/types';

function mergeQuestReviews(books: SavedBook[], uid: string): Promise<SavedBook[]> {
  return getReadingQuest(uid).then((quest) =>
    books.map((book) => {
      if (book.review) return book;
      const docId = collectionDocId(book.title, book.author);
      const questEntry = quest.books.find((b) => b.docId === docId);
      if (questEntry?.review) {
        return { ...book, review: questEntry.review };
      }
      return book;
    })
  );
}

function isValidBook(body: unknown): body is Book {
  if (!body || typeof body !== 'object') return false;
  const b = body as Book;
  return (
    typeof b.title === 'string' &&
    b.title.trim().length > 0 &&
    typeof b.author === 'string' &&
    typeof b.id === 'string'
  );
}

export async function GET() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const books = await mergeQuestReviews(await getUserCollection(uid), uid);
    const enriched = await enrichBooksWithPrices(books);

    const originalByKey = new Map(books.map((b) => [bookKey(b), b]));
    const updates = enriched.filter((book) => {
      const original = originalByKey.get(bookKey(book));
      return original && !hasPrice(original) && hasPrice(book);
    });

    await Promise.all(updates.map((book) => addBookToCollection(uid, book)));

    return NextResponse.json({ books: enriched });
  } catch (err) {
    console.error('[collection GET]', err);
    return NextResponse.json({ error: 'Failed to load collection' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

  const payload = body as {
    action?: string;
    book?: Book;
    rating?: number;
    text?: string;
  };

  if (payload.action === 'review') {
    if (!isValidBook(payload.book) || typeof payload.rating !== 'number' || typeof payload.text !== 'string') {
      return NextResponse.json({ error: 'Invalid review payload' }, { status: 400 });
    }
    if (!isValidReview(payload.rating, payload.text)) {
      return NextResponse.json(
        { error: `Review needs 1–5 stars and at least ${MIN_REVIEW_WORDS} words` },
        { status: 400 }
      );
    }
    try {
      const review = {
        rating: payload.rating,
        text: payload.text.trim(),
        wordCount: countReviewWords(payload.text),
        submittedAt: new Date().toISOString(),
      };
      const saved = await submitCollectionReview(
        uid,
        payload.book.title,
        payload.book.author,
        review
      );

      const quest = await getReadingQuest(uid);
      const docId = collectionDocId(payload.book.title, payload.book.author);
      const questEntry = quest.books.find((b) => b.docId === docId);
      if (questEntry && !isQuestBookReviewed(questEntry)) {
        await submitQuestReview(uid, payload.book.title, payload.book.author, review);
      }

      return NextResponse.json({ book: saved });
    } catch (err) {
      console.error('[collection POST review]', err);
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }
  }

  if (!isValidBook(body)) {
    return NextResponse.json({ error: 'Invalid book data' }, { status: 400 });
  }

  try {
    const withPrice = await enrichBookWithPrice(body);
    const saved = await addBookToCollection(uid, withPrice);
    return NextResponse.json({ book: saved });
  } catch (err) {
    console.error('[collection POST]', err);
    return NextResponse.json({ error: 'Failed to save book' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const title = request.nextUrl.searchParams.get('title');
  const author = request.nextUrl.searchParams.get('author');

  if (!title || !author) {
    return NextResponse.json(
      { error: 'Provide ?title= and ?author= query params' },
      { status: 400 }
    );
  }

  try {
    await removeBookFromCollection(uid, title, author);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[collection DELETE]', err);
    return NextResponse.json({ error: 'Failed to remove book' }, { status: 500 });
  }
}

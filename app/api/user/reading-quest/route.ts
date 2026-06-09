import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  addBooksToQuest,
  getReadingQuest,
  removeBookFromQuest,
  submitQuestReview,
} from '@/lib/firebase/reading-quest';
import {
  countReviewWords,
  isValidReview,
  MIN_REVIEW_WORDS,
  QUEST_BOOK_GOAL,
} from '@/lib/reading-quest';
import type { Book } from '@/lib/types';

function isValidBook(body: unknown): body is Book {
  if (!body || typeof body !== 'object') return false;
  const b = body as Book;
  return typeof b.title === 'string' && typeof b.author === 'string' && typeof b.id === 'string';
}

export async function GET() {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const quest = await getReadingQuest(uid);
    return NextResponse.json({ quest, goal: QUEST_BOOK_GOAL });
  } catch (err) {
    console.error('[reading-quest GET]', err);
    return NextResponse.json({ error: 'Failed to load quest' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: { books?: unknown; book?: unknown; action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    if (body.action === 'remove') {
      const b = body.book;
      if (!isValidBook(b)) {
        return NextResponse.json({ error: 'Invalid book' }, { status: 400 });
      }
      const quest = await removeBookFromQuest(uid, b.title, b.author);
      return NextResponse.json({ quest });
    }

    if (body.action === 'review') {
      const payload = body as {
        book?: Book;
        rating?: number;
        text?: string;
      };
      if (!isValidBook(payload.book) || typeof payload.rating !== 'number' || typeof payload.text !== 'string') {
        return NextResponse.json({ error: 'Invalid review payload' }, { status: 400 });
      }
      if (!isValidReview(payload.rating, payload.text)) {
        return NextResponse.json(
          { error: `Review needs 1–5 stars and at least ${MIN_REVIEW_WORDS} words` },
          { status: 400 }
        );
      }
      const quest = await submitQuestReview(uid, payload.book.title, payload.book.author, {
        rating: payload.rating,
        text: payload.text.trim(),
        wordCount: countReviewWords(payload.text),
        submittedAt: new Date().toISOString(),
      });
      return NextResponse.json({ quest });
    }

    const books: Book[] = [];
    if (Array.isArray(body.books)) {
      for (const b of body.books) {
        if (isValidBook(b)) books.push(b);
      }
    } else if (isValidBook(body.book)) {
      books.push(body.book);
    }

    if (books.length === 0) {
      return NextResponse.json({ error: 'No valid books provided' }, { status: 400 });
    }

    const quest = await addBooksToQuest(uid, books);
    return NextResponse.json({ quest });
  } catch (err) {
    console.error('[reading-quest POST]', err);
    return NextResponse.json({ error: 'Quest update failed' }, { status: 500 });
  }
}

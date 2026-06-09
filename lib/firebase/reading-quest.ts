import type { Book } from '@/lib/types';
import {
  emptyQuest,
  isQuestComplete,
  mergeQuestBooks,
  type QuestBookEntry,
  type QuestReview,
  type ReadingQuestData,
} from '@/lib/reading-quest';
import { collectionDocId } from '@/lib/book-id';
import { getAdminDb } from './admin';

function questRef(uid: string) {
  return getAdminDb().collection('users').doc(uid).collection('quest').doc('current');
}

export async function getReadingQuest(uid: string): Promise<ReadingQuestData> {
  const snap = await questRef(uid).get();
  if (!snap.exists) return emptyQuest();
  const data = snap.data() as ReadingQuestData;
  return { ...emptyQuest(), ...data, books: data.books ?? [] };
}

async function saveReadingQuest(uid: string, quest: ReadingQuestData): Promise<ReadingQuestData> {
  const next: ReadingQuestData = {
    ...quest,
    updatedAt: new Date().toISOString(),
  };
  if (isQuestComplete(next) && next.status !== 'completed') {
    next.status = 'completed';
    next.completedAt = new Date().toISOString();
  }
  await questRef(uid).set(next, { merge: true });
  return next;
}

export async function addBooksToQuest(uid: string, books: Book[]): Promise<ReadingQuestData> {
  const quest = await getReadingQuest(uid);
  if (quest.status === 'completed') return quest;

  const merged = mergeQuestBooks(quest.books, books);
  return saveReadingQuest(uid, { ...quest, books: merged });
}

export async function removeBookFromQuest(
  uid: string,
  title: string,
  author: string
): Promise<ReadingQuestData> {
  const quest = await getReadingQuest(uid);
  const docId = collectionDocId(title, author);
  const books = quest.books.filter((b) => b.docId !== docId);
  return saveReadingQuest(uid, {
    ...quest,
    books,
    status: 'active',
    completedAt: undefined,
  });
}

export async function submitQuestReview(
  uid: string,
  title: string,
  author: string,
  review: QuestReview
): Promise<ReadingQuestData> {
  const quest = await getReadingQuest(uid);
  const docId = collectionDocId(title, author);
  const books: QuestBookEntry[] = quest.books.map((b) =>
    b.docId === docId ? { ...b, review } : b
  );

  if (!books.some((b) => b.docId === docId)) {
    throw new Error('Book not in quest');
  }

  return saveReadingQuest(uid, { ...quest, books });
}

import type { Book } from '@/lib/types';
import type { QuestReview } from '@/lib/reading-quest';
import { collectionDocId } from '@/lib/book-id';
import { getAdminDb } from './admin';

export interface SavedBook extends Book {
  savedAt: string;
  review?: QuestReview;
}

function collectionRef(uid: string) {
  return getAdminDb().collection('users').doc(uid).collection('collection');
}

export async function getUserCollection(uid: string): Promise<SavedBook[]> {
  const snap = await collectionRef(uid).orderBy('savedAt', 'desc').get();
  return snap.docs.map((doc) => doc.data() as SavedBook);
}

export async function addBookToCollection(uid: string, book: Book): Promise<SavedBook> {
  const docId = collectionDocId(book.title, book.author);
  const saved: SavedBook = {
    ...book,
    savedAt: new Date().toISOString(),
  };
  await collectionRef(uid).doc(docId).set(saved, { merge: true });
  return saved;
}

export async function removeBookFromCollection(
  uid: string,
  title: string,
  author: string
): Promise<void> {
  const docId = collectionDocId(title, author);
  await collectionRef(uid).doc(docId).delete();
}

export async function isBookInCollection(
  uid: string,
  title: string,
  author: string
): Promise<boolean> {
  const docId = collectionDocId(title, author);
  const snap = await collectionRef(uid).doc(docId).get();
  return snap.exists;
}

export async function submitCollectionReview(
  uid: string,
  title: string,
  author: string,
  review: QuestReview
): Promise<SavedBook> {
  const docId = collectionDocId(title, author);
  const ref = collectionRef(uid).doc(docId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error('Book not in collection');
  }
  const saved = { ...(snap.data() as SavedBook), review };
  await ref.set(saved, { merge: true });
  return saved;
}

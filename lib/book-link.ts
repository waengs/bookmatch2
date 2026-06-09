import type { Book } from '@/lib/types';

type BookLinkFields = Pick<Book, 'id' | 'title' | 'author' | 'externalUrl'>;

export function googleBooksSearchUrl(title: string, author: string): string {
  const query = [title, author].filter(Boolean).join(' ');
  return `https://books.google.com/books?q=${encodeURIComponent(query)}`;
}

export function getBookExternalUrl(book: BookLinkFields): string {
  if (book.externalUrl) return book.externalUrl;

  if (book.id.startsWith('gb-')) {
    const volumeId = book.id.slice(3);
    if (volumeId) {
      return `https://books.google.com/books?id=${encodeURIComponent(volumeId)}`;
    }
  }

  return googleBooksSearchUrl(book.title, book.author);
}

async function resolveBookUrl(book: BookLinkFields): Promise<string> {
  if (book.externalUrl || book.id.startsWith('gb-')) {
    return getBookExternalUrl(book);
  }

  try {
    const params = new URLSearchParams({
      title: book.title,
      author: book.author,
    });
    const res = await fetch(`/api/books/link?${params}`);
    if (res.ok) {
      const data = (await res.json()) as { url?: string };
      if (data.url) return data.url;
    }
  } catch {
    /* use search fallback */
  }

  return googleBooksSearchUrl(book.title, book.author);
}

export async function openBookExternalUrl(book: BookLinkFields): Promise<void> {
  const url = await resolveBookUrl(book);
  window.open(url, '_blank', 'noopener,noreferrer');
}

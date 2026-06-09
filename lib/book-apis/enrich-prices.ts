import type { Book } from '@/lib/types';
import { fetchGoogleBookPrice, resolveGoogleBookLink } from './google-books';
import { hasPrice } from '@/lib/price';

export async function enrichBookWithPrice(book: Book): Promise<Book> {
  let next = book;

  if (!book.externalUrl && !book.id.startsWith('gb-')) {
    const link = await resolveGoogleBookLink(book.title, book.author);
    if (link) {
      next = {
        ...next,
        externalUrl: link.externalUrl,
        id: book.id.startsWith('gb-') ? book.id : `gb-${link.volumeId}`,
      };
    }
  }

  if (hasPrice(next)) return next;

  const priceInfo = await fetchGoogleBookPrice(next.title, next.author);
  if (!priceInfo) return next;

  return {
    ...next,
    price: priceInfo.price,
    currency: priceInfo.currency,
  };
}

export async function enrichBooksWithPrices(books: Book[]): Promise<Book[]> {
  const needsPrice = books.filter((b) => !hasPrice(b));
  if (needsPrice.length === 0) return books;

  const enriched = await Promise.all(
    books.map(async (book) => {
      if (hasPrice(book)) return book;
      return enrichBookWithPrice(book);
    })
  );

  return enriched;
}

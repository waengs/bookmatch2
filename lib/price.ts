import type { Book } from '@/lib/types';
import { collectionDocId } from '@/lib/book-id';

export interface PriceTotals {
  byCurrency: Record<string, number>;
  pricedCount: number;
  unpricedCount: number;
  selectedCount: number;
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function bookKey(book: Pick<Book, 'title' | 'author'>): string {
  return collectionDocId(book.title, book.author);
}

export function hasPrice(book: Book): boolean {
  return typeof book.price === 'number' && book.price > 0 && !!book.currency;
}

export function calculateSelectedTotals(
  books: Book[],
  selectedKeys: Set<string>
): PriceTotals {
  const byCurrency: Record<string, number> = {};
  let pricedCount = 0;
  let unpricedCount = 0;
  let selectedCount = 0;

  for (const book of books) {
    const key = bookKey(book);
    if (!selectedKeys.has(key)) continue;
    selectedCount++;

    if (hasPrice(book)) {
      const currency = book.currency!;
      byCurrency[currency] = (byCurrency[currency] ?? 0) + book.price!;
      pricedCount++;
    } else {
      unpricedCount++;
    }
  }

  return { byCurrency, pricedCount, unpricedCount, selectedCount };
}

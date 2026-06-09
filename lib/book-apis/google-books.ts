import type { RawBook } from './normalize';

interface GoogleMoney {
  amount?: number;
  currencyCode?: string;
}

interface GoogleVolume {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    categories?: string[];
    description?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    averageRating?: number;
    ratingsCount?: number;
  };
  saleInfo?: {
    saleability?: string;
    listPrice?: GoogleMoney;
    retailPrice?: GoogleMoney;
  };
}

interface GoogleResponse {
  items?: GoogleVolume[];
}

export interface BookPriceInfo {
  price: number;
  currency: string;
}

export interface GoogleVolumeLink {
  volumeId: string;
  externalUrl: string;
}

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchesVolume(
  volumeTitle: string,
  title: string,
  volumeAuthors: string[] | undefined,
  author: string
): boolean {
  const volTitle = normalizeForMatch(volumeTitle);
  const wantTitle = normalizeForMatch(title);
  const titleMatch =
    volTitle.includes(wantTitle.slice(0, Math.min(12, wantTitle.length)))
    || wantTitle.includes(volTitle.slice(0, Math.min(12, volTitle.length)));

  if (!volumeAuthors?.length) return titleMatch;

  const authorLast = author.toLowerCase().split(/\s+/).pop() ?? '';
  const authorMatch = volumeAuthors.some((name) => {
    const parts = name.toLowerCase().split(/\s+/);
    return parts.some((part) => part.length > 2 && part.includes(authorLast))
      || name.toLowerCase().includes(author.toLowerCase().split(' ')[0] ?? '');
  });

  return titleMatch && authorMatch;
}

export function googleVolumeUrl(volumeId: string): string {
  return `https://books.google.com/books?id=${encodeURIComponent(volumeId)}`;
}

export async function resolveGoogleBookLink(
  title: string,
  author: string
): Promise<GoogleVolumeLink | null> {
  const queries = [
    `${title} ${author}`,
    `${author} ${title}`,
  ];

  for (const query of queries) {
    const items = await fetchGoogleVolumes(query, 5);
    for (const item of items) {
      const info = item.volumeInfo;
      if (!item.id || !info?.title) continue;
      if (!matchesVolume(info.title, title, info.authors, author)) continue;
      return { volumeId: item.id, externalUrl: googleVolumeUrl(item.id) };
    }
  }

  return null;
}

function extractPrice(item: GoogleVolume): BookPriceInfo | undefined {
  const sale = item.saleInfo;
  if (!sale || sale.saleability === 'NOT_FOR_SALE') return undefined;

  const money = sale.retailPrice?.amount != null ? sale.retailPrice : sale.listPrice;
  if (money?.amount == null || !money.currencyCode) return undefined;
  if (money.amount <= 0) return undefined;

  return { price: money.amount, currency: money.currencyCode };
}

function mapGoogleItem(item: GoogleVolume, i: number): RawBook | null {
  const info = item.volumeInfo;
  if (!info?.title) return null;

  const cover = info.imageLinks?.thumbnail?.replace('http:', 'https:')
    ?? info.imageLinks?.smallThumbnail?.replace('http:', 'https:');
  const priceInfo = extractPrice(item);

  const volumeId = item.id;
  return {
    id: `gb-${volumeId ?? i}`,
    title: info.title,
    author: info.authors?.[0] ?? 'Unknown',
    tags: (info.categories ?? []).slice(0, 3),
    coverUrl: cover,
    rating: info.averageRating,
    reviews: info.ratingsCount ? String(info.ratingsCount) : undefined,
    description: typeof info.description === 'string'
      ? info.description.slice(0, 300)
      : undefined,
    source: 'google',
    externalUrl: volumeId ? googleVolumeUrl(volumeId) : undefined,
    price: priceInfo?.price,
    currency: priceInfo?.currency,
  };
}

async function fetchGoogleVolumes(query: string, limit: number): Promise<GoogleVolume[]> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', query);
  url.searchParams.set('maxResults', String(limit));
  url.searchParams.set('printType', 'books');
  url.searchParams.set('orderBy', 'relevance');

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return [];

  const data: GoogleResponse = await res.json();
  return data.items ?? [];
}

export async function searchGoogleBooks(query: string, limit = 6): Promise<RawBook[]> {
  const items = await fetchGoogleVolumes(query, limit);
  return items
    .map((item, i) => mapGoogleItem(item, i))
    .filter((b): b is RawBook => b !== null);
}

export async function fetchGoogleBookPrice(
  title: string,
  author: string
): Promise<BookPriceInfo | null> {
  const queries = [`${title} ${author}`, `${author} ${title}`];

  for (const query of queries) {
    const items = await fetchGoogleVolumes(query, 5);
    for (const item of items) {
      const info = item.volumeInfo;
      if (!info?.title) continue;
      if (!matchesVolume(info.title, title, info.authors, author)) continue;

      const price = extractPrice(item);
      if (price) return price;
    }
  }

  return null;
}

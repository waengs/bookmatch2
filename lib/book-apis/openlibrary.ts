import type { RawBook } from './normalize';

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  subject?: string[];
  cover_i?: number;
  ratings_average?: number;
  ratings_count?: number;
  first_sentence?: string[];
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

export async function searchOpenLibrary(query: string, limit = 8): Promise<RawBook[]> {
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('fields', 'key,title,author_name,subject,cover_i,ratings_average,ratings_count');

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return [];

  const data: OpenLibraryResponse = await res.json();
  return (data.docs ?? [])
    .filter((doc) => doc.title && doc.author_name?.[0])
    .map((doc, i) => ({
      id: `ol-${doc.key?.replace(/\//g, '-') ?? i}`,
      title: doc.title!,
      author: doc.author_name![0],
      tags: (doc.subject ?? []).slice(0, 4).map((s) => s.split('--')[0].trim()),
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : undefined,
      rating: doc.ratings_average,
      reviews: doc.ratings_count ? String(doc.ratings_count) : undefined,
      source: 'openlibrary',
    }));
}

export async function searchOpenLibraryBySubject(subject: string, limit = 6): Promise<RawBook[]> {
  const url = new URL('https://openlibrary.org/subjects/' + encodeURIComponent(subject.toLowerCase()) + '.json');
  url.searchParams.set('limit', String(limit));

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) return searchOpenLibrary(subject, limit);

  const data = await res.json();
  const works = data.works ?? [];

  return works
    .filter((w: { title?: string; authors?: { name: string }[] }) => w.title)
    .map((w: { key?: string; title: string; authors?: { name: string }[]; cover_id?: number }, i: number) => ({
      id: `ol-subj-${w.key?.replace(/\//g, '-') ?? i}`,
      title: w.title,
      author: w.authors?.[0]?.name ?? 'Unknown',
      tags: [subject],
      coverUrl: w.cover_id
        ? `https://covers.openlibrary.org/b/id/${w.cover_id}-M.jpg`
        : undefined,
      source: 'openlibrary',
    }));
}

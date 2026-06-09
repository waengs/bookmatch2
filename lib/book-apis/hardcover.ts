import type { RawBook } from './normalize';

interface HardcoverSearchHit {
  id?: number;
  title?: string;
  author_names?: string[];
  genres?: string[];
  moods?: string[];
  tags?: string[];
  rating?: number;
  ratings_count?: number;
  cached_image?: { url?: string } | string;
  description?: string;
}

interface HardcoverSearchResponse {
  data?: {
    search?: {
      results?: HardcoverSearchHit[];
    };
  };
  errors?: { message: string }[];
}

function parseImage(cached: HardcoverSearchHit['cached_image']): string | undefined {
  if (!cached) return undefined;
  if (typeof cached === 'string') {
    try {
      const parsed = JSON.parse(cached) as { url?: string };
      return parsed.url;
    } catch {
      return undefined;
    }
  }
  return cached.url;
}

export async function searchHardcover(query: string, limit = 8): Promise<RawBook[]> {
  const token = process.env.HARDCOVER_API_TOKEN;
  if (!token) return [];

  const gql = `
    query SearchBooks($query: String!, $limit: Int!) {
      search(
        query: $query
        query_type: "Book"
        per_page: $limit
        page: 1
      ) {
        results
      }
    }
  `;

  try {
    const res = await fetch('https://api.hardcover.app/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: gql, variables: { query, limit } }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const data: HardcoverSearchResponse = await res.json();
    if (data.errors?.length) return [];

    const results = data.data?.search?.results ?? [];

    return results
      .filter((hit) => hit.title)
      .map((hit, i) => {
        const tags = [
          ...(hit.genres ?? []),
          ...(hit.moods ?? []),
          ...(hit.tags ?? []),
        ].slice(0, 4);

        return {
          id: `hc-${hit.id ?? i}`,
          title: hit.title!,
          author: hit.author_names?.[0] ?? 'Unknown',
          tags: tags.length ? tags : ['Fiction'],
          coverUrl: parseImage(hit.cached_image),
          rating: hit.rating,
          reviews: hit.ratings_count ? String(hit.ratings_count) : undefined,
          description: hit.description?.slice(0, 300),
          source: 'hardcover',
        };
      });
  } catch {
    return [];
  }
}

export async function searchHardcoverByGenre(genre: string, limit = 6): Promise<RawBook[]> {
  return searchHardcover(genre, limit);
}

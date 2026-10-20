import {
  TMDBMovie,
  TMDBTVShow,
  TMDBPaginatedResponse,
  TMDBMediaItem,
  TMDBSeasonDetail
} from "../types/tmdb";

const PRODUCTION_API_FALLBACK = "https://streamflix-04zq.onrender.com/api";

function getApiBaseUrl(): string {
  // Never fall back to localhost in a production deployment: server-side ISR
  // would silently fetch an unreachable URL and cache empty/404 responses.
  let url =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_API_FALLBACK
      : "http://localhost:5000/api");
  url = url.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

export class BackendApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BackendApiError";
    this.status = status;
  }
}

interface BackendFetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

async function fetchFromBackend<T>(endpoint: string, options: BackendFetchOptions = {}): Promise<T> {
  const apiBase = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${apiBase}${cleanEndpoint}`;
  
  const { next, ...fetchOptions } = options;

  // Don't abort during `next build`: a cold Render instance can take longer
  // than the runtime timeout, and generateStaticParams should be allowed to
  // wait for it instead of silently prebuilding an empty catalog.
  const isBuild =
    typeof window === "undefined" &&
    process.env.NEXT_PHASE === "phase-production-build";

  const res = await fetch(url, {
    ...fetchOptions,
    // Prevent a sleeping/failing backend from holding an ISR render open.
    signal:
      fetchOptions.signal ??
      (isBuild ? undefined : AbortSignal.timeout(15_000)),
    headers: {
      "Accept": "application/json",
      ...(fetchOptions.headers || {})
    },
    // Next.js caching options - default to 3600s unless explicitly overridden
    next: next !== undefined ? next : { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new BackendApiError(
      res.status,
      `API Error: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<T>;
}

export const mediaApi = {
  // Discovery
  getTrending: () => fetchFromBackend<TMDBPaginatedResponse<TMDBMediaItem>>("/media/trending"),
  getTopPicks: () => fetchFromBackend<TMDBPaginatedResponse<TMDBTVShow>>("/media/top-picks"),
  getFanFavorites: () => fetchFromBackend<TMDBPaginatedResponse<TMDBMediaItem>>("/media/fan-favorites"),
  getByGenre: (type: "movie" | "tv", genreId: number) =>
    fetchFromBackend<TMDBPaginatedResponse<TMDBMediaItem>>(`/media/genre/${type}/${genreId}`),

  // Details - cache for 24 hours (86400s) to match page ISR and eliminate redundant serverless invocations
  getMovieDetails: (id: number | string) =>
    fetchFromBackend<TMDBMovie>(`/movie/${id}`, { next: { revalidate: 86400 } }),
  getTVDetails: (id: number | string) =>
    fetchFromBackend<TMDBTVShow>(`/tv/${id}`, { next: { revalidate: 86400 } }),
  getTVSeason: (tvId: number | string, seasonNumber: number | string) =>
    fetchFromBackend<TMDBSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`, { next: { revalidate: 86400 } }),

  // Search
  search: (query: string, page = 1) =>
    fetchFromBackend<TMDBPaginatedResponse<TMDBMediaItem>>(`/search?q=${encodeURIComponent(query)}&page=${page}`),

  // Curated catalog for sitemap
  getCuratedCatalog: () =>
    fetchFromBackend<Array<{ id: number; title: string; media_type: "movie" | "tv"; releaseDate?: string }>>("/curated/catalog", { next: { revalidate: 43200 } })
};

import {
  TMDBMovie,
  TMDBTVShow,
  TMDBPaginatedResponse,
  TMDBMediaItem,
  TMDBSeasonDetail,
  TMDBWatchItem,
  TMDBDetailView
} from "../types/tmdb";
import { readCache, writeCache } from "../utils/cache";

const PRODUCTION_API_FALLBACK = "https://streamflix-04zq.onrender.com/api";

function getApiBaseUrl(): string {
  // Never fall back to localhost in a production deployment: server-side
  // rendering would silently fetch an unreachable URL and cache empty/404
  // responses.
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

  const { next, headers: rawHeaders, ...fetchOptions } = options;

  // Don't abort during `next build`: a cold Render instance can take longer
  // than the runtime timeout, and generateStaticParams should be allowed to
  // wait for it instead of silently prebuilding an empty catalog.
  const isBuild =
    typeof window === "undefined" &&
    process.env.NEXT_PHASE === "phase-production-build";

  const headers = new Headers(rawHeaders);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  // Server-side/build requests have no browser Origin, so they authenticate
  // with the shared key. The key is never bundled into client JavaScript.
  if (typeof window === "undefined" && process.env.API_SECRET) {
    headers.set("X-API-Key", process.env.API_SECRET);
  }

  const res = await fetch(url, {
    ...fetchOptions,
    // Prevent a sleeping/failing backend from holding a render open.
    signal:
      fetchOptions.signal ??
      (isBuild ? undefined : AbortSignal.timeout(15_000)),
    headers,
    // Next.js caching options - default to 3600s unless explicitly overridden
    next: next !== undefined ? next : { revalidate: 3600 }
  });

  if (!res.ok) {
    const hint =
      res.status === 403
        ? " (check that API_SECRET matches on Vercel and Render)"
        : "";
    throw new BackendApiError(
      res.status,
      `API Error: ${res.status} ${res.statusText}${hint}`
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

  // Full details - used only at build time for the static SEO pages.
  getMovieDetails: (id: number | string) =>
    fetchFromBackend<TMDBMovie>(`/movie/${id}`, { next: { revalidate: 86400 } }),
  getTVDetails: (id: number | string) =>
    fetchFromBackend<TMDBTVShow>(`/tv/${id}`, { next: { revalidate: 86400 } }),

  // Lean details - used by the client-rendered /title shell.
  getDetailView: async (
    type: "movie" | "tv",
    id: number | string,
    signal?: AbortSignal
  ): Promise<TMDBDetailView> => {
    const key = `detail:${type}:${id}`;
    const cached = readCache<TMDBDetailView>(key);
    if (cached) return cached;

    const data = await fetchFromBackend<TMDBDetailView>(`/${type}/${id}?view=detail`, {
      signal,
      next: { revalidate: 3600 }
    });
    writeCache(key, data);
    // Reuse the same payload for the watch page.
    writeCache(`watch:${type}:${id}`, data);
    return data;
  },

  // Lean watch payload - used by /watch and cached across navigation.
  getWatchDetails: async (
    type: "movie" | "tv",
    id: number | string,
    signal?: AbortSignal
  ): Promise<TMDBWatchItem> => {
    const key = `watch:${type}:${id}`;
    const cached = readCache<TMDBWatchItem>(key);
    if (cached) return cached;

    const data = await fetchFromBackend<TMDBWatchItem>(`/${type}/${id}?view=watch`, {
      signal,
      next: { revalidate: 3600 }
    });
    writeCache(key, data);
    return data;
  },

  getTVSeason: async (
    tvId: number | string,
    seasonNumber: number | string,
    signal?: AbortSignal
  ): Promise<TMDBSeasonDetail> => {
    const key = `season:${tvId}:${seasonNumber}`;
    const cached = readCache<TMDBSeasonDetail>(key);
    if (cached) return cached;

    const data = await fetchFromBackend<TMDBSeasonDetail>(
      `/tv/${tvId}/season/${seasonNumber}`,
      { signal, next: { revalidate: 86400 } }
    );
    writeCache(key, data);
    return data;
  },

  // Search - cache the first page for a few minutes to absorb repeated queries.
  search: async (
    query: string,
    page = 1,
    signal?: AbortSignal
  ): Promise<TMDBPaginatedResponse<TMDBMediaItem>> => {
    const key = `search:${query}:${page}`;
    if (page === 1) {
      const cached = readCache<TMDBPaginatedResponse<TMDBMediaItem>>(key, 5 * 60 * 1000);
      if (cached) return cached;
    }

    const data = await fetchFromBackend<TMDBPaginatedResponse<TMDBMediaItem>>(
      `/search?q=${encodeURIComponent(query)}&page=${page}`,
      { signal }
    );
    if (page === 1) {
      writeCache(key, data);
    }
    return data;
  },

  // Curated catalog for sitemap
  getCuratedCatalog: () =>
    fetchFromBackend<Array<{ id: number; title: string; media_type: "movie" | "tv"; releaseDate?: string }>>("/curated/catalog", { next: { revalidate: 43200 } })
};

import {
  TMDBMovie,
  TMDBTVShow,
  TMDBPaginatedResponse,
  TMDBMediaItem,
  TMDBSeasonDetail
} from "../types/tmdb";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchFromBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.headers || {})
    },
    // Next.js caching options
    next: { revalidate: 3600 }
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
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

  // Details
  getMovieDetails: (id: number | string) => fetchFromBackend<TMDBMovie>(`/movie/${id}`),
  getTVDetails: (id: number | string) => fetchFromBackend<TMDBTVShow>(`/tv/${id}`),
  getTVSeason: (tvId: number | string, seasonNumber: number | string) =>
    fetchFromBackend<TMDBSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`),

  // Search
  search: (query: string, page = 1) =>
    fetchFromBackend<TMDBPaginatedResponse<TMDBMediaItem>>(`/search?q=${encodeURIComponent(query)}&page=${page}`),

  // Curated catalog for sitemap
  getCuratedCatalog: () =>
    fetchFromBackend<Array<{ id: number; title: string; media_type: "movie" | "tv"; releaseDate?: string }>>("/curated/catalog")
};

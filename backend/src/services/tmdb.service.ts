import { env } from "../config/env.js";
import {
  TMDBMovie,
  TMDBTVShow,
  TMDBPaginatedResponse,
  TMDBMediaItem,
  TMDBSeasonDetail
} from "../types/api.types.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export class TMDBService {
  private static apiKey = env.TMDB_API_KEY;

  private static async fetchFromTMDB<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append("api_key", this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API Error (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  // Media Discovery & Trending
  static async getTrendingAllWeek(): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBMediaItem>>("/trending/all/week");
  }

  static async getTopPicks(): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBTVShow>>("/discover/tv", {
      sort_by: "popularity.desc"
    });
  }

  static async getMoviesByGenre(genreId: number, page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBMovie>>("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page
    });
  }

  static async getTVByGenre(genreId: number, page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBTVShow>>("/discover/tv", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page
    });
  }

  static async getPopularMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBMovie>>("/movie/popular", { page });
  }

  static async getPopularTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBTVShow>>("/tv/popular", { page });
  }

  static async getTopRatedMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBMovie>>("/movie/top_rated", { page });
  }

  // Movie Details
  static async getMovieDetails(id: number): Promise<TMDBMovie> {
    return this.fetchFromTMDB<TMDBMovie>(`/movie/${id}`, {
      append_to_response: "videos,credits,similar"
    });
  }

  // TV Details
  static async getTVDetails(id: number): Promise<TMDBTVShow> {
    return this.fetchFromTMDB<TMDBTVShow>(`/tv/${id}`, {
      append_to_response: "videos,credits,similar"
    });
  }

  // TV Season & Episodes
  static async getTVSeason(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetail> {
    return this.fetchFromTMDB<TMDBSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
  }

  // Search
  static async searchMulti(query: string, page = 1): Promise<TMDBPaginatedResponse<TMDBMediaItem>> {
    return this.fetchFromTMDB<TMDBPaginatedResponse<TMDBMediaItem>>("/search/multi", {
      query,
      page
    });
  }
}

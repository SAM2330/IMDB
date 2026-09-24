export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  vote_average: number;
  vote_count: number;
  popularity?: number;
  genres?: TMDBGenre[];
  runtime?: number;
  tagline?: string;
  media_type?: "movie";
  videos?: {
    results: TMDBVideo[];
  };
  credits?: {
    cast: TMDBCast[];
    crew?: TMDBCrew[];
  };
  similar?: {
    results: TMDBMovie[];
  };
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity?: number;
  genres?: TMDBGenre[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TMDBSeasonSummary[];
  media_type?: "tv";
  videos?: {
    results: TMDBVideo[];
  };
  credits?: {
    cast: TMDBCast[];
    crew?: TMDBCrew[];
  };
  similar?: {
    results: TMDBTVShow[];
  };
}

export interface TMDBSeasonSummary {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  vote_average?: number;
  runtime?: number;
}

export interface TMDBSeasonDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episodes: TMDBEpisode[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TMDBCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrew {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genres?: TMDBGenre[];
  media_type?: "movie" | "tv" | "person";
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface WatchlistStoredItem {
  id: number;
  title: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
  overview?: string;
  vote_average?: number;
  release_date?: string;
}

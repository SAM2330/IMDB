import {
  TMDBCast,
  TMDBGenre,
  TMDBMovie,
  TMDBSeasonSummary,
  TMDBTVShow,
  TMDBVideo
} from "../types/api.types.js";

export type MediaType = "movie" | "tv";

export interface MediaCardView {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  media_type: MediaType;
  release_date?: string;
  first_air_date?: string;
}

export interface MediaWatchView {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  number_of_seasons?: number;
  seasons?: TMDBSeasonSummary[];
}

export interface MediaDetailView extends MediaWatchView {
  overview: string;
  genres?: TMDBGenre[];
  credits?: { cast: TMDBCast[] };
  videos?: { results: TMDBVideo[] };
  similar?: { results: MediaCardView[] };
}

function trimSimilar(
  items: Array<TMDBMovie | TMDBTVShow>,
  type: MediaType
): MediaCardView[] {
  return items.slice(0, 12).map((item) => ({
    id: item.id,
    title: "title" in item ? item.title : undefined,
    name: "name" in item ? item.name : undefined,
    poster_path: item.poster_path,
    media_type: type,
    release_date: "release_date" in item ? item.release_date : undefined,
    first_air_date: "first_air_date" in item ? item.first_air_date : undefined
  }));
}

function trimSeasons(seasons?: TMDBSeasonSummary[]): TMDBSeasonSummary[] | undefined {
  return seasons?.map((season) => ({
    id: season.id,
    name: season.name,
    overview: season.overview,
    poster_path: season.poster_path,
    season_number: season.season_number,
    episode_count: season.episode_count,
    air_date: season.air_date
  }));
}

function pickTrailer(videos?: { results: TMDBVideo[] }): TMDBVideo | undefined {
  const youtube = videos?.results?.filter((video) => video.site === "YouTube") || [];
  return (
    youtube.find((video) => video.type === "Trailer" && video.official) ||
    youtube.find((video) => video.type === "Trailer") ||
    youtube.find((video) => video.type === "Teaser") ||
    youtube[0]
  );
}

export function toWatchView(
  item: TMDBMovie | TMDBTVShow,
  type: MediaType
): MediaWatchView {
  const base = {
    id: item.id,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average
  };

  if (type === "movie") {
    const movie = item as TMDBMovie;
    return {
      ...base,
      title: movie.title,
      release_date: movie.release_date,
      runtime: movie.runtime
    };
  }

  const show = item as TMDBTVShow;
  return {
    ...base,
    name: show.name,
    first_air_date: show.first_air_date,
    number_of_seasons: show.number_of_seasons,
    seasons: trimSeasons(show.seasons)
  };
}

export function toDetailView(
  item: TMDBMovie | TMDBTVShow,
  type: MediaType
): MediaDetailView {
  const trailer = pickTrailer(item.videos);
  return {
    ...toWatchView(item, type),
    overview: item.overview,
    genres: item.genres,
    credits: item.credits
      ? {
          cast: item.credits.cast.slice(0, 5).map((member) => ({
            id: member.id,
            name: member.name,
            character: member.character,
            profile_path: member.profile_path,
            order: member.order
          }))
        }
      : undefined,
    videos: trailer ? { results: [trailer] } : undefined,
    similar: item.similar
      ? { results: trimSimilar(item.similar.results, type) }
      : undefined
  };
}

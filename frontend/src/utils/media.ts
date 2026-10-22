import { TMDBMediaCard, TMDBMediaItem } from "../types/tmdb";

/**
 * Strip a TMDB item down to the fields actually used by MovieCard and
 * MediaCarousel. This keeps large `overview`, `credits`, `videos`, etc. out of
 * the RSC payload sent to the browser.
 */
export function toMediaCard(item: TMDBMediaItem): TMDBMediaCard {
  // Some discovery endpoints (e.g. /discover/tv for Top Picks) do not include
  // media_type. Infer it so cards link to /tv/... instead of /movie/...,
  // which would 404 now that detail routes are prebuilt only.
  const media_type =
    item.media_type ??
    (item.title ? "movie" : item.name ? "tv" : undefined);

  return {
    id: item.id,
    title: item.title,
    name: item.name,
    poster_path: item.poster_path,
    media_type,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
  };
}

export function toMediaCards(items: TMDBMediaItem[]): TMDBMediaCard[] {
  return items.map(toMediaCard);
}

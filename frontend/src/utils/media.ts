import { TMDBMediaCard, TMDBMediaItem } from "../types/tmdb";

/**
 * Strip a TMDB item down to the fields actually used by MovieCard and
 * MediaCarousel. This keeps large `overview`, `credits`, `videos`, etc. out of
 * the RSC payload sent to the browser.
 */
export function toMediaCard(item: TMDBMediaItem): TMDBMediaCard {
  return {
    id: item.id,
    title: item.title,
    name: item.name,
    poster_path: item.poster_path,
    media_type: item.media_type,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
  };
}

export function toMediaCards(items: TMDBMediaItem[]): TMDBMediaCard[] {
  return items.map(toMediaCard);
}

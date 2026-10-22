import { PREBUILD_ITEMS } from "../generated/prebuild-manifest";

const PREBUILT_KEYS = new Set(
  PREBUILD_ITEMS.map((item) => `${item.media_type}:${item.id}`)
);

export function slugify(text: string): string {
  if (!text) return "watch";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getMediaDetailUrl(id: number, type: "movie" | "tv", title?: string): string {
  const slug = slugify(title || "details");
  return `/${type}/${id}/${slug}`;
}

/**
 * Long-tail titles are rendered by the static `/title` client shell. This is
 * the fallback for titles that were not included in the build-time manifest.
 */
export function getClientDetailUrl(id: number, type: "movie" | "tv"): string {
  return `/title?type=${type}&id=${id}`;
}

export function isPrebuiltTitle(id: number, type: "movie" | "tv"): boolean {
  return PREBUILT_KEYS.has(`${type}:${id}`);
}

/**
 * Prefer the canonical static detail page when it exists so internal links pass
 * crawl equity to indexable pages. Long-tail titles fall back to `/title`.
 */
export function getPreferredDetailUrl(
  id: number,
  type: "movie" | "tv",
  title?: string
): string {
  return isPrebuiltTitle(id, type)
    ? getMediaDetailUrl(id, type, title)
    : getClientDetailUrl(id, type);
}

export function getWatchUrl(id: number, type: "movie" | "tv", season?: number, episode?: number): string {
  if (type === "tv") {
    if (season !== undefined && episode !== undefined) {
      return `/watch?id=${id}&type=tv&season=${season}&episode=${episode}`;
    }
    return `/watch?id=${id}&type=tv`;
  }
  return `/watch?id=${id}&type=movie`;
}

export function getTMDBImageUrl(path: string | null | undefined, size: "w500" | "original" = "w500"): string {
  if (!path) return "https://via.placeholder.com/300x450?text=No+Image";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

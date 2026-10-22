import { mediaApi } from "../services/api";
import { TMDBMediaItem } from "../types/tmdb";

export interface PrebuildItem {
  id: number;
  media_type: "movie" | "tv";
  title: string;
}

type MediaType = "movie" | "tv";

function inferType(item: TMDBMediaItem, forcedType?: MediaType): MediaType | null {
  if (forcedType) return forcedType;
  if (item.media_type === "movie" || item.media_type === "tv") {
    return item.media_type;
  }
  if (item.media_type === "person") {
    return null;
  }
  return item.name && !item.title ? "tv" : "movie";
}

/**
 * The exact set of titles pre-rendered at build time. It combines the curated
 * SEO catalog with every title the homepage can link to. Keeping the homepage
 * static means these links can safely use canonical detail URLs with
 * `dynamicParams = false`; search/watchlist/similar links use `/title` instead.
 */
export async function getPrebuildItems(): Promise<PrebuildItem[]> {
  const buckets: Array<{
    promise: Promise<{ results?: TMDBMediaItem[] }>;
    type?: MediaType;
  }> = [
    { promise: mediaApi.getTrending() },
    { promise: mediaApi.getTopPicks(), type: "tv" },
    { promise: mediaApi.getFanFavorites() },
    { promise: mediaApi.getByGenre("movie", 28), type: "movie" },
    { promise: mediaApi.getByGenre("tv", 18), type: "tv" },
    { promise: mediaApi.getByGenre("movie", 35), type: "movie" },
    { promise: mediaApi.getByGenre("movie", 53), type: "movie" },
    { promise: mediaApi.getByGenre("tv", 10765), type: "tv" },
    { promise: mediaApi.getByGenre("tv", 80), type: "tv" },
    { promise: mediaApi.getByGenre("tv", 9648), type: "tv" }
  ];

  const [results, catalog] = await Promise.all([
    Promise.all(buckets.map((bucket) => bucket.promise)),
    mediaApi.getCuratedCatalog()
  ]);

  const byKey = new Map<string, PrebuildItem>();

  const add = (item: TMDBMediaItem, forcedType?: MediaType) => {
    const mediaType = inferType(item, forcedType);
    if (!mediaType) return;

    const title = item.title || item.name;
    if (!title) return;

    byKey.set(`${mediaType}:${item.id}`, {
      id: item.id,
      media_type: mediaType,
      title
    });
  };

  results.forEach((result, index) => {
    const items = result.results || [];
    for (const item of items) {
      add(item, buckets[index].type);
    }
  });

  for (const item of catalog) {
    byKey.set(`${item.media_type}:${item.id}`, {
      id: item.id,
      media_type: item.media_type,
      title: item.title || "details"
    });
  }

  const items = Array.from(byKey.values()).sort((a, b) => {
    if (a.media_type !== b.media_type) return a.media_type.localeCompare(b.media_type);
    return a.title.localeCompare(b.title);
  });

  if (items.length === 0) {
    throw new Error("Unable to build the pre-render catalog: all backend requests failed.");
  }

  return items;
}

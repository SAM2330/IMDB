"use client";

import { useEffect } from "react";
import { TMDBWatchItem } from "../../types/tmdb";
import { writeCache } from "../../utils/cache";

/**
 * Seeds the watch-page cache from a server-rendered detail page, so clicking
 * "Watch Now" does not refetch the same title from Render.
 */
export function MediaCache({
  type,
  item
}: {
  type: "movie" | "tv";
  item: TMDBWatchItem;
}) {
  useEffect(() => {
    writeCache(`watch:${type}:${item.id}`, item);
  }, [type, item]);

  return null;
}

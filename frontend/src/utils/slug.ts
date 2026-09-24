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

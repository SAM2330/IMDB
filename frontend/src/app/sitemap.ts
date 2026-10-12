import { MetadataRoute } from "next";
import { mediaApi } from "../services/api";
import { slugify } from "../utils/slug";

function parseValidDate(dateStr?: string | null): Date {
  const now = new Date();
  if (!dateStr || typeof dateStr !== "string") return now;

  const trimmed = dateStr.trim();
  // Filter out dummy/placeholder values like '0000-00-00' or non-dates
  if (
    !trimmed ||
    trimmed.startsWith("0000") ||
    trimmed.toLowerCase() === "undefined" ||
    trimmed.toLowerCase() === "null"
  ) {
    return now;
  }

  const parsed = new Date(trimmed);
  // Ensure valid date timestamp and reasonable range (after 1900)
  if (isNaN(parsed.getTime()) || parsed.getTime() < new Date("1900-01-01").getTime()) {
    return now;
  }

  // Google Search Console rejects sitemaps with "Invalid date" if lastmod is in the future.
  // Upcoming movies/TV shows from TMDB trending/popular have future release dates.
  if (parsed.getTime() > now.getTime()) {
    return now;
  }

  return parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et").replace(/\/+$/, "");

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const curatedCatalog = await mediaApi.getCuratedCatalog();

    if (Array.isArray(curatedCatalog)) {
      const mediaEntries: MetadataRoute.Sitemap = curatedCatalog.map((item) => {
        const slug = slugify(item.title || "details");
        const url = `${siteUrl}/${item.media_type}/${item.id}/${slug}`;
        return {
          url,
          lastModified: parseValidDate(item.releaseDate),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        };
      });

      return [...staticEntries, ...mediaEntries];
    }
  } catch {
    // Return static homepage entry if catalog fetch fails during build
  }

  return staticEntries;
}

import { MetadataRoute } from "next";
import { mediaApi } from "../services/api";
import { slugify } from "../utils/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et").replace(/\/+$/, "");

  // Static homepage entry - updated daily with trending releases
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const curatedCatalog = await mediaApi.getCuratedCatalog();

    if (Array.isArray(curatedCatalog)) {
      // Omit lastModified for media items: Google Search Console rejects release dates
      // (like 1962 or pre-epoch dates) as invalid webpage lastmod dates.
      // Sitemaps.org and Google recommend omitting lastmod when a true webpage modification date is unavailable.
      const mediaEntries: MetadataRoute.Sitemap = curatedCatalog.map((item) => {
        const slug = slugify(item.title || "details");
        const url = `${siteUrl}/${item.media_type}/${item.id}/${slug}`;
        return {
          url,
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

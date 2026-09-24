import { MetadataRoute } from "next";
import { mediaApi } from "../services/api";
import { slugify } from "../utils/slug";

function parseValidDate(dateStr?: string | null): Date {
  if (!dateStr || typeof dateStr !== "string") return new Date();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
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

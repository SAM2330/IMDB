import { MetadataRoute } from "next";
import { mediaApi } from "../services/api";
import { slugify } from "../utils/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";
  const currentDate = new Date().toISOString().split("T")[0];

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    const curatedCatalog = await mediaApi.getCuratedCatalog();

    const mediaEntries: MetadataRoute.Sitemap = curatedCatalog.map((item) => {
      const slug = slugify(item.title || "details");
      const url = `${siteUrl}/${item.media_type}/${item.id}/${slug}`;
      return {
        url,
        lastModified: item.releaseDate || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    });

    return [...staticEntries, ...mediaEntries];
  } catch (err) {
    console.error("Error generating sitemap:", err);
    return staticEntries;
  }
}

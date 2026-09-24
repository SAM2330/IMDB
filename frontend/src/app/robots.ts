import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/watch", "/search", "/watchlist", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

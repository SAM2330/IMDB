import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://streamflix.pro.et").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /title serves noindex, nofollow and is the redirect target for
        // long-tail/old detail URLs. Let crawlers fetch it so they can see
        // the noindex instead of reporting a robots-blocked redirect target.
        disallow: ["/watch", "/search", "/watchlist", "/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

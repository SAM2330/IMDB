const fs = require("fs");
const path = require("path");

const DOMAIN = process.env.SITE_URL || "https://streamflix.pro.et";
const SITEMAP_PATH = path.resolve(__dirname, "..", "sitemap.xml");
const today = new Date().toISOString().split("T")[0];

const indexablePages = [
  { path: "", priority: "1.0", changefreq: "daily" }
];

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateSitemap() {
  const urlEntries = indexablePages.map(page => {
    const fullUrl = page.path ? `${DOMAIN}/${page.path}` : `${DOMAIN}/`;
    return `  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join("\n")}
</urlset>
`;

  fs.writeFileSync(SITEMAP_PATH, sitemapXml, "utf-8");
  console.log(`Generated sitemap.xml with ${urlEntries.length} indexable URL.`);
}

generateSitemap();

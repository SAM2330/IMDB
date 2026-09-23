const fs = require('fs');
const path = require('path');

// ==============================================================================
// DOMAIN CONFIGURATION
// Live Domain: https://streamflix.pro.et
// ==============================================================================
const DOMAIN = process.env.SITE_URL || 'https://streamflix.pro.et';
const TMDB_KEY = "4f232ac1c3f1cf94a52c682491f7fa6e";
const TMDB_BASE = "https://api.themoviedb.org/3";
const SITEMAP_PATH = path.resolve(__dirname, '..', 'sitemap.xml');

const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'search.html', priority: '0.8', changefreq: 'weekly' },
  { path: 'movie.html', priority: '0.7', changefreq: 'weekly' },
  { path: 'watch.html', priority: '0.7', changefreq: 'weekly' },
  { path: 'watchlist.html', priority: '0.5', changefreq: 'monthly' }
];

async function fetchTrending() {
  try {
    const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${TMDB_KEY}`);
    if (!res.ok) throw new Error(`TMDB HTTP error ${res.status}`);
    const data = await res.json();
    return (data.results || []).slice(0, 50);
  } catch (err) {
    console.warn('Warning: Could not fetch TMDB trending items for sitemap:', err.message);
    return [];
  }
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generateSitemap() {
  console.log(`Generating sitemap.xml with base domain: ${DOMAIN}`);
  const trending = await fetchTrending();
  console.log(`Fetched ${trending.length} trending titles from TMDB.`);

  const urlEntries = [];

  // Add static entry points
  for (const page of staticPages) {
    const fullUrl = page.path ? `${DOMAIN}/${page.path}` : `${DOMAIN}/`;
    urlEntries.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Add dynamic movie & TV pages
  for (const item of trending) {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    if (!item.id) continue;

    const releaseDate = item.release_date || item.first_air_date || today;

    // Movie detail page
    const movieUrl = `${DOMAIN}/movie.html?id=${item.id}&type=${mediaType}`;
    urlEntries.push(`  <url>
    <loc>${escapeXml(movieUrl)}</loc>
    <lastmod>${releaseDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);

    // Watch player page
    const watchUrl = `${DOMAIN}/watch.html?id=${item.id}&type=${mediaType}`;
    urlEntries.push(`  <url>
    <loc>${escapeXml(watchUrl)}</loc>
    <lastmod>${releaseDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;

  fs.writeFileSync(SITEMAP_PATH, sitemapXml, 'utf-8');
  console.log(`Successfully generated sitemap.xml with ${urlEntries.length} total URLs.`);
}

generateSitemap();

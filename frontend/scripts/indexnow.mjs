// Submit URLs to IndexNow (Bing, Yandex, Seznam, Naver).
// Usage:
//   node scripts/indexnow.mjs                 # homepage + first 24 sitemap URLs
//   node scripts/indexnow.mjs <url> [url...]  # explicit URLs
//   node scripts/indexnow.mjs --all           # submit every sitemap URL

const HOST = "streamflix.pro.et";
const KEY = "429a8b91affc4425bc8fd915d8f4f907";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP = `https://${HOST}/sitemap.xml`;

const args = process.argv.slice(2);

async function getSitemapUrls() {
  const response = await fetch(SITEMAP, { headers: { "user-agent": "StreamFlix-IndexNow/1.0" } });
  if (!response.ok) throw new Error(`Sitemap fetch failed: ${response.status}`);

  const xml = await response.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
}

async function submit(urls) {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const body = await response.text();
      console.log(`${endpoint} -> ${response.status} ${response.statusText}${body ? `: ${body}` : ""}`);
      if (response.ok) return;
      lastError = new Error(`IndexNow rejected the submission: ${response.status}`);
    } catch (error) {
      lastError = error;
      console.error(`${endpoint} -> ${error.message}`);
    }
  }

  throw lastError ?? new Error("IndexNow submission failed");
}

let urls;
if (args.includes("--all")) {
  urls = await getSitemapUrls();
} else if (args.length > 0) {
  urls = args;
} else {
  urls = (await getSitemapUrls()).slice(0, 25);
}

if (urls.length === 0) {
  throw new Error("No URLs to submit");
}

console.log(`Submitting ${urls.length} URL(s) to IndexNow:`);
for (const url of urls) console.log(`  ${url}`);

await submit(urls);

# StreamFlix — Modern Next.js & Express Architecture

A production-ready full-stack migration of **StreamFlix** featuring a **Next.js (App Router)** frontend with server-rendered SEO and a secure **Node.js Express + PostgreSQL (Prisma)** backend with TMDB integration, caching, rate limiting, and 12 streaming server providers.

---

## 🌟 Key Architecture & Features

### 1. Frontend (`/frontend`)
* **Next.js 14+ App Router & React**: Modern component architecture with Server Components for SEO and Client Components for interactivity.
* **Preserved Dark Theme & Aesthetics**: Netflix-style dark layout (`#0a0a0a`), red accents (`#e50914`), gold star ratings (`#f5c518`), and hover zoom animations (`scale(1.08)`).
* **Homepage**:
  * Dynamic trending Hero Banner with high-resolution backdrop and actions.
  * 🔥 Trending Top 10 section (Top 3 large spotlight cards + Ranks 4–10 badges).
  * 9 Smooth auto-scrolling carousels (Top Picks, Fan Favorites, Action, Drama, Comedy, Thriller, Sci-Fi, Crime, Mystery).
* **Movie & TV Detail Pages**:
  * Semantic, permanent URLs: `/movie/[id]/[slug]` and `/tv/[id]/[slug]`.
  * Build-time static pages for the curated SEO catalog and homepage titles (`dynamicParams = false`, no ISR writes).
  * Server-side rendered metadata, Open Graph, and Twitter sharing cards.
  * Schema.org `Movie` and `TVSeries` structured JSON-LD with aggregate ratings.
  * Embedded YouTube trailer player.
  * Similar titles recommendations carousel.
* **Any-title `/title` shell**:
  * A single static client-rendered page opens any TMDB movie or TV show not in the prebuilt SEO set.
  * Search, watchlist, and similar-title links use `/title?type=...&id=...`, so long-tail titles never create on-demand ISR pages.
  * `/title` is `noindex, nofollow` (no long-tail SEO).
* **Watch Page & Streaming Player**:
  * 12 Streaming server providers with instant switching.
  * TV Show Season selector tabs & episode grid with runtimes and descriptions.
  * Fullscreen popup video player with episode navigation (Prev/Next) and keyboard controls (`ESC`).
  * Uses a lean watch API response and session-scoped client caching.
* **Search**: Debounced (700ms) multi-search with a 2-character minimum, request cancellation, and 5-minute client caching.
* **Watchlist**: Instant client-side `localStorage` saved titles with remove actions.
* **SEO**: A small static `sitemap.xml` for the prebuilt catalog, `robots.txt`, and 301 permanent redirects from legacy `.html` URLs.
* **Analytics**: Integrated Google Analytics (`gtag`) & Umami scripts without page transition duplicate tracking.

---

### 2. Backend (`/backend`)
* **Node.js + Express + TypeScript**: Decoupled, modular REST API.
* **Secure TMDB Integration**: API keys never exposed to browser clients.
* **In-Memory Caching (`node-cache`)**: Response caching with tailored TTLs to optimize TMDB API limits and sub-30ms latencies.
* **HTTP cache headers**: Public GET responses include `Cache-Control` so browsers and CDNs can reuse them.
* **Rate Limiting (`express-rate-limit`)**: Global plus per-route limits for search and details. Trusted build/server requests with the API key are exempt.
* **Origin + API-key guard**: Browser traffic must come from an allowed frontend origin; server-side requests must send the shared `X-API-Key`.
* **Lean API views**: `?view=watch` and `?view=detail` return only the fields the watch page and `/title` shell need, instead of full TMDB payloads.
* **PostgreSQL & Prisma ORM**: Extensible data models for Users, MediaItems, and Watchlists ready for future authentication and cross-device sync.
* **CORS Configured**: Secure cross-origin resource sharing for production domains.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* Node.js v18+ (tested on Node v24)
* npm

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
NODE_ENV=development
PORT=5000
TMDB_API_KEY=your_tmdb_api_key_here
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/streamflix?schema=public
CACHE_DEFAULT_TTL=3600
API_SECRET=replace_with_a_long_random_string
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
API_SECRET=replace_with_the_same_long_random_string_as_render
NEXT_PUBLIC_GA_ID=G-GM491BBS2F
NEXT_PUBLIC_UMAMI_WEBSITE_ID=0fbb83bd-d242-44ea-b99b-fe81f1380d03
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
```

`API_SECRET` is server-only. Never prefix it with `NEXT_PUBLIC_`.

### 3. Run Development Servers
From the root directory:
```bash
# Start both backend and frontend concurrently
npm run dev

# Or run individually:
npm run dev:backend   # Express API on http://localhost:5000
npm run dev:frontend  # Next.js App on http://localhost:3000
```

---

## 🛠️ Production Build & Verification

```bash
# Build both services
npm run build

# Or build individually
npm run build:backend
npm run build:frontend
```

---

## 🚢 Deployment Guide

### Deploying the Backend on Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`
6. Add Environment Variables:
   * `NODE_ENV`: `production`
   * `PORT`: `10000`
   * `TMDB_API_KEY`: *(Your TMDB Key)*
   * `FRONTEND_URL`: `https://streamflix.pro.et` (or your Vercel URL)
   * `DATABASE_URL`: *(PostgreSQL connection string or Render PostgreSQL database)*
   * `API_SECRET`: *(The same long random value you add to Vercel)*
   * `ALLOWED_ORIGINS`: *(Optional comma-separated preview/custom origins)*

*(Alternatively, use the included `backend/render.yaml` blueprint).*

### Deploying the Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Next.js`.
4. Add Environment Variables:
   * `NEXT_PUBLIC_SITE_URL`: `https://streamflix.pro.et`
   * `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api`
   * `API_SECRET`: *(Must exactly match Render's `API_SECRET`; server-only)*
   * `NEXT_PUBLIC_GA_ID`: `G-GM491BBS2F`
   * `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: `0fbb83bd-d242-44ea-b99b-fe81f1380d03`
   * `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: `https://cloud.umami.is/script.js`
5. Deploy.

### Refreshing the static catalog
The homepage and SEO detail pages are build-time static, so they are refreshed by a new deployment. `.github/workflows/refresh-static.yml` triggers a Vercel deploy hook every Monday (and can be run manually). Add a repository secret named `VERCEL_DEPLOY_HOOK_URL` with a Vercel Deploy Hook URL to enable it. Until then, deploy manually when the catalog should change.

Long-tail titles do **not** need a rebuild: they open through the static `/title` shell.

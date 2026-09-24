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
  * Server-side rendered (SSR) metadata, Open Graph, and Twitter sharing cards.
  * Schema.org `Movie` and `TVSeries` structured JSON-LD with aggregate ratings.
  * Embedded YouTube trailer player.
  * Similar titles recommendations carousel.
* **Watch Page & Streaming Player**:
  * 12 Streaming server providers with instant switching.
  * TV Show Season selector tabs & episode grid with runtimes and descriptions.
  * Fullscreen popup video player with episode navigation (Prev/Next) and keyboard controls (`ESC`).
* **Search**: Real-time debounced multi-search for movies & TV series.
* **Watchlist**: Instant client-side `localStorage` saved titles with remove actions.
* **SEO**: Dynamic `sitemap.xml`, `robots.txt`, and 301 permanent redirects from legacy `.html` URLs.
* **Analytics**: Integrated Google Analytics (`gtag`) & Umami scripts without page transition duplicate tracking.

---

### 2. Backend (`/backend`)
* **Node.js + Express + TypeScript**: Decoupled, modular REST API.
* **Secure TMDB Integration**: API keys never exposed to browser clients.
* **In-Memory Caching (`node-cache`)**: Response caching with tailored TTLs to optimize TMDB API limits and sub-30ms latencies.
* **Rate Limiting (`express-rate-limit`)**: Protects endpoints from abuse.
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
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GA_ID=G-GM491BBS2F
NEXT_PUBLIC_UMAMI_WEBSITE_ID=0fbb83bd-d242-44ea-b99b-fe81f1380d03
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://cloud.umami.is/script.js
```

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

*(Alternatively, use the included `backend/render.yaml` blueprint).*

### Deploying the Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Next.js`.
4. Add Environment Variables:
   * `NEXT_PUBLIC_SITE_URL`: `https://streamflix.pro.et`
   * `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api`
   * `NEXT_PUBLIC_GA_ID`: `G-GM491BBS2F`
   * `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: `0fbb83bd-d242-44ea-b99b-fe81f1380d03`
   * `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: `https://cloud.umami.is/script.js`
5. Deploy.

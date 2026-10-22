import { Router } from "express";
import { MediaController } from "../controllers/media.controller.js";
import { MovieController } from "../controllers/movie.controller.js";
import { TVController } from "../controllers/tv.controller.js";
import { WatchlistController } from "../controllers/watchlist.controller.js";
import { cacheMiddleware } from "../middlewares/cache.js";
import { detailsLimiter, searchLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Media routes
router.get("/media/trending", cacheMiddleware(3600), MediaController.getTrending);
router.get("/media/top-picks", cacheMiddleware(3600), MediaController.getTopPicks);
router.get("/media/fan-favorites", cacheMiddleware(3600), MediaController.getFanFavorites);
router.get("/media/genre/:type/:genreId", cacheMiddleware(7200), MediaController.getByGenre);

// Search route
router.get("/search", searchLimiter, cacheMiddleware(900), MediaController.search);

// Movie & TV Details routes
router.get("/movie/:id", detailsLimiter, cacheMiddleware(86400), MovieController.getDetails);
router.get("/tv/:id", detailsLimiter, cacheMiddleware(86400), TVController.getDetails);
router.get(
  "/tv/:id/season/:seasonNumber",
  detailsLimiter,
  cacheMiddleware(86400),
  TVController.getSeason
);

// Curated Catalog (for dynamic sitemap generation)
router.get("/curated/catalog", cacheMiddleware(43200), MediaController.getCuratedCatalog);

// Watchlist routes (Database integration)
router.get("/watchlist/:userId", WatchlistController.getWatchlist);
router.post("/watchlist/:userId", WatchlistController.addToWatchlist);
router.delete("/watchlist/:userId/:mediaType/:mediaId", WatchlistController.removeFromWatchlist);

export default router;

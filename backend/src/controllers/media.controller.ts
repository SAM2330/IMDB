import { Request, Response, NextFunction } from "express";
import { TMDBService } from "../services/tmdb.service.js";

export class MediaController {
  // GET /api/media/trending
  static async getTrending(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TMDBService.getTrendingAllWeek();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/media/top-picks
  static async getTopPicks(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TMDBService.getTopPicks();
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/media/fan-favorites
  static async getFanFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await TMDBService.getTrendingAllWeek();
      // Filter items with vote_count > 500 matching the original logic
      const fanFavorites = data.results.filter(item => (item.vote_count || 0) > 500);
      res.json({
        ...data,
        results: fanFavorites
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/media/genre/:type/:genreId
  static async getByGenre(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, genreId } = req.params;
      const parsedGenreId = parseInt(genreId, 10);
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      if (isNaN(parsedGenreId)) {
        return res.status(400).json({ error: "Invalid genre ID" });
      }

      let data;
      if (type === "tv") {
        data = await TMDBService.getTVByGenre(parsedGenreId, page);
        data.results = data.results.map(r => ({ ...r, media_type: "tv" as const }));
      } else {
        data = await TMDBService.getMoviesByGenre(parsedGenreId, page);
        data.results = data.results.map(r => ({ ...r, media_type: "movie" as const }));
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/search?q=query
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string)?.trim();
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;

      if (!query) {
        return res.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
      }

      const data = await TMDBService.searchMulti(query, page);
      // Filter out people as in original script
      const filteredResults = data.results.filter(item => item.media_type !== "person");

      res.json({
        ...data,
        results: filteredResults
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/curated/catalog
  // Returns stable popular & trending movie and tv items for sitemap generation
  static async getCuratedCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const [trending, popularMovies, popularTV] = await Promise.all([
        TMDBService.getTrendingAllWeek(),
        TMDBService.getPopularMovies(1),
        TMDBService.getPopularTV(1)
      ]);

      const itemsMap = new Map<string, { id: number; title: string; media_type: "movie" | "tv"; releaseDate?: string }>();

      trending.results.forEach(item => {
        const type = item.media_type === "tv" || ("name" in item && !("title" in item)) ? "tv" : "movie";
        const title = ("title" in item ? item.title : item.name) || "";
        const date = ("release_date" in item ? item.release_date : item.first_air_date) || "";
        itemsMap.set(`${type}_${item.id}`, { id: item.id, title, media_type: type, releaseDate: date });
      });

      popularMovies.results.forEach(m => {
        itemsMap.set(`movie_${m.id}`, { id: m.id, title: m.title, media_type: "movie", releaseDate: m.release_date });
      });

      popularTV.results.forEach(s => {
        itemsMap.set(`tv_${s.id}`, { id: s.id, title: s.name, media_type: "tv", releaseDate: s.first_air_date });
      });

      res.json(Array.from(itemsMap.values()));
    } catch (error) {
      next(error);
    }
  }
}

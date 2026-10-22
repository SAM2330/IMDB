import { Request, Response, NextFunction } from "express";
import { TMDBService } from "../services/tmdb.service.js";
import { toDetailView, toWatchView } from "../utils/mediaView.js";

export class MovieController {
  // GET /api/movie/:id?view=watch|detail
  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }

      const movie = await TMDBService.getMovieDetails(id);

      if (req.query.view === "watch") {
        return res.json(toWatchView(movie, "movie"));
      }
      if (req.query.view === "detail") {
        return res.json(toDetailView(movie, "movie"));
      }

      res.json(movie);
    } catch (error) {
      next(error);
    }
  }
}

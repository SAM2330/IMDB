import { Request, Response, NextFunction } from "express";
import { TMDBService } from "../services/tmdb.service.js";

export class MovieController {
  // GET /api/movie/:id
  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid movie ID" });
      }

      const movie = await TMDBService.getMovieDetails(id);
      res.json(movie);
    } catch (error) {
      next(error);
    }
  }
}

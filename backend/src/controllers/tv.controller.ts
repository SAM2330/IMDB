import { Request, Response, NextFunction } from "express";
import { TMDBService } from "../services/tmdb.service.js";

export class TVController {
  // GET /api/tv/:id
  static async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid TV show ID" });
      }

      const show = await TMDBService.getTVDetails(id);
      res.json(show);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tv/:id/season/:seasonNumber
  static async getSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const seasonNumber = parseInt(req.params.seasonNumber, 10);

      if (isNaN(id) || isNaN(seasonNumber)) {
        return res.status(400).json({ error: "Invalid TV show ID or season number" });
      }

      const season = await TMDBService.getTVSeason(id, seasonNumber);
      res.json(season);
    } catch (error) {
      next(error);
    }
  }
}

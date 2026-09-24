import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.service.js";

export class WatchlistController {
  // GET /api/watchlist/:userId
  static async getWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const items = await prisma.watchlistItem.findMany({
        where: { userId },
        include: { mediaItem: true },
        orderBy: { addedAt: "desc" }
      });
      res.json(items);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/watchlist/:userId
  static async addToWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { mediaId, mediaType, title, overview, posterPath, backdropPath, releaseDate, voteAverage, voteCount, genres } = req.body;

      if (!mediaId || !mediaType || !title) {
        return res.status(400).json({ error: "Missing required media fields" });
      }

      const type = mediaType.toUpperCase() === "TV" ? "TV" : "MOVIE";

      // Upsert user if needed
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId }
      });

      // Upsert media item
      await prisma.mediaItem.upsert({
        where: { id_mediaType: { id: mediaId, mediaType: type } },
        update: { title, overview, posterPath, backdropPath, releaseDate, voteAverage, voteCount, genres },
        create: { id: mediaId, mediaType: type, title, overview, posterPath, backdropPath, releaseDate, voteAverage, voteCount, genres }
      });

      // Create watchlist entry
      const entry = await prisma.watchlistItem.upsert({
        where: {
          userId_mediaId_mediaType: {
            userId,
            mediaId,
            mediaType: type
          }
        },
        update: {},
        create: {
          userId,
          mediaId,
          mediaType: type
        },
        include: { mediaItem: true }
      });

      res.status(201).json(entry);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/watchlist/:userId/:mediaType/:mediaId
  static async removeFromWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, mediaType, mediaId } = req.params;
      const parsedId = parseInt(mediaId, 10);
      const type = mediaType.toUpperCase() === "TV" ? "TV" : "MOVIE";

      await prisma.watchlistItem.deleteMany({
        where: {
          userId,
          mediaId: parsedId,
          mediaType: type
        }
      });

      res.json({ success: true, message: "Removed from watchlist" });
    } catch (error) {
      next(error);
    }
  }
}

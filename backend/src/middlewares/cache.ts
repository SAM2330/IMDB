import { Request, Response, NextFunction } from "express";
import NodeCache from "node-cache";
import { env } from "../config/env.js";

const cache = new NodeCache({
  stdTTL: env.CACHE_DEFAULT_TTL,
  checkperiod: 120,
  useClones: false
});

export const cacheMiddleware = (durationSeconds: number = env.CACHE_DEFAULT_TTL) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    // Let browsers and any upstream CDN cache public GET responses too. This
    // removes repeat traffic from Render's bandwidth bill.
    res.setHeader(
      "Cache-Control",
      `public, max-age=${durationSeconds}, stale-while-revalidate=${Math.min(
        durationSeconds,
        3600
      )}`
    );

    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedResponse);
    }

    // Override res.json to store in cache before sending
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, durationSeconds);
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
};

export const clearCacheKey = (key: string) => {
  cache.del(`__express__${key}`);
};

export const flushAllCache = () => {
  cache.flushAll();
};

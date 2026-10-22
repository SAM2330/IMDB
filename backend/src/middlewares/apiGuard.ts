import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { allowedOrigins } from "../config/origins.js";

/**
 * CORS does not stop direct API requests. This guard allows:
 * - browser requests from a known frontend origin
 * - server-side/build requests carrying the shared X-API-Key
 *
 * If API_SECRET is not configured yet, the guard fails open so an existing
 * deployment does not break. Configure API_SECRET on Render and Vercel to
 * enable protection.
 */
export function apiGuard(req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    return next();
  }

  if (!env.API_SECRET) {
    return next();
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    return next();
  }

  const apiKey = req.headers["x-api-key"];
  if (typeof apiKey === "string" && apiKey === env.API_SECRET) {
    return next();
  }

  return res.status(403).json({ error: "Forbidden" });
}

export function isTrustedServerRequest(req: Request): boolean {
  return Boolean(
    env.API_SECRET &&
      typeof req.headers["x-api-key"] === "string" &&
      req.headers["x-api-key"] === env.API_SECRET
  );
}

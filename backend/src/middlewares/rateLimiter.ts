import rateLimit from "express-rate-limit";
import { isTrustedServerRequest } from "./apiGuard.js";

const rateLimitMessage = {
  status: 429,
  message: "Too many requests from this IP, please try again after a minute."
};

// Browser traffic. Server-side/build requests with the API key are exempt so a
// large static build can pre-render the catalog without tripping the limit.
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTrustedServerRequest,
  message: rateLimitMessage
});

export const detailsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTrustedServerRequest,
  message: rateLimitMessage
});

export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTrustedServerRequest,
  message: rateLimitMessage
});

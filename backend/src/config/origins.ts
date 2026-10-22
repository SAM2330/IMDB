import { env } from "./env.js";

const configuredOrigins = (env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const allowedOrigins = Array.from(
  new Set([
    env.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://streamflix.pro.et",
    "https://www.streamflix.pro.et",
    "https://streamflix45.netlify.app",
    ...configuredOrigins
  ])
);

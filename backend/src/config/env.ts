import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().default("5000").transform(val => parseInt(val, 10)),
  TMDB_API_KEY: z.string().min(1, "TMDB_API_KEY is required"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().optional(),
  CACHE_DEFAULT_TTL: z.string().default("3600").transform(val => parseInt(val, 10))
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

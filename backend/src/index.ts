import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { allowedOrigins } from "./config/origins.js";
import { apiGuard } from "./middlewares/apiGuard.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import apiRoutes from "./routes/api.js";

const app = express();

// Trust reverse proxy (Render, Cloudflare, Load Balancers) for accurate IP resolution in rate limiter
app.set("trust proxy", 1);

// Security and CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
  })
);

app.use(express.json());

// Reject direct API traffic that is neither from the frontend origin nor carrying
// the shared server key. This runs before the rate limiter so blocked bots do not
// consume the limiter budget.
app.use("/api", apiGuard);

// Global Rate Limiting
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "streamflix-backend"
  });
});

// Mount API routes
app.use("/api", apiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 StreamFlix Backend running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  if (!env.API_SECRET) {
    console.warn("⚠️  API_SECRET is not set; direct API requests are not protected.");
  }
});

export default app;

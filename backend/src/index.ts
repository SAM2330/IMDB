import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import apiRoutes from "./routes/api.js";

const app = express();

// Trust reverse proxy (Render, Cloudflare, Load Balancers) for accurate IP resolution in rate limiter
app.set("trust proxy", 1);

// Security and CORS configuration
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:3000", "https://streamflix.pro.et", "https://streamflix45.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

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
});

export default app;

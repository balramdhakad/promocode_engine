import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./infrastructure/db/index.js";
import "./infrastructure/redis.js";
import authRoutes from "./modules/auth/auth.routes.js";
import promoRoutes from "./modules/promoCode/promoCode.routes.js";
import whitelistRoutes from "./modules/whitelist/whitelist.routes.js";
import redemptionRoutes from "./modules/redemption/redemption.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import {
  globalRateLimiter,
  submitRateLimiter,
} from "./middlewares/rateLimit.js";
import helmet from "helmet";
import { db } from "./infrastructure/db/index.js";
import { sql } from "drizzle-orm";
import { redis } from "./infrastructure/redis.js";
import env from "./config/env.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/health", async (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date(),
    services: {},
  };

  try {
    await db.execute(sql`SELECT 1`);
    health.services.postgres = "connected";
  } catch (err) {
    health.services.postgres = "disconnected";
    health.status = "FAIL";
  }

  try {
    await redis.ping();
    health.services.redis = "connected";
  } catch (err) {
    health.services.redis = "disconnected";
    health.status = "FAIL";
  }

  const statusCode = health.status === "OK" ? 200 : 500;

  res.status(statusCode).json(health);
});

app.use(globalRateLimiter);
app.use(helmet());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/promo", promoRoutes);
app.use("/api/v1/whitelist", whitelistRoutes);
app.use("/api/v1/redemptions", redemptionRoutes);
app.use("/api/v1/orders", submitRateLimiter, orderRoutes);

app.use(errorHandler);
export default app;

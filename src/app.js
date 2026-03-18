import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./infrastructure/db/index.js";
import "./infrastructure/redis.js";
import authRoutes from "./modules/auth/auth.routes.js";
import promoRoutes from "./modules/promoCode/promoCode.routes.js";
import { globalRateLimiter } from "./middlewares/rateLimit.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalRateLimiter);

app.get("/health", async (req, res) => {});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/promo", promoRoutes);

app.use(errorHandler);
export default app;

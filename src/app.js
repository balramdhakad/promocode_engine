import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./infrastructure/db/index.js";
import "./infrastructure/redis.js"
import authRoutes from "./modules/auth/auth.routes.js";
import { globalRateLimiter } from "./middlewares/rateLimit.js";

const app = express();
app.use(globalRateLimiter)

app.get("/health", async (req, res) => {});
app.use("/api/auth", authRoutes);

app.use(errorHandler);
export default app;

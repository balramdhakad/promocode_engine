import Redis from "ioredis";
import env from "../config/env.js";

const { redisConfig } = env;

const defaultOptions = {
  host: redisConfig.host,
  port: redisConfig.port,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

export const redis = new Redis(defaultOptions);

redis.on("connect", () => {
  console.log(`Redis Connection Success`);
});

redis.on("error", (error) => {
  console.error(`Redis Connection Error :${error}`);
});

redis.on("close", () => {
  console.error(`Redis Connection Closed`);
});


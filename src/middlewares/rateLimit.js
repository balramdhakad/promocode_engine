import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { RateLimitError } from "../utils/errors.js";
import { redis } from "../infrastructure/redis.js";

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,

  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),

  keyGenerator: (req) => ipKeyGenerator(req),

  handler: (req, res, next, options) => {
    res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
    return next(
      new RateLimitError(
        "Too many requests. Please try again later.",
      ),
    );
  },
});

export const submitRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),

  keyGenerator: (req) => {
    return req.user?.id || ipKeyGenerator(req);
  },

  handler: (req, res, next, options) => {
    res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
    return next(
      new RateLimitError(
        "Too many requests. Please try again later.",
      ),
    );
  },
});

export const loginEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),

  keyGenerator: (req) => {
    const email = req.body?.email?.toLowerCase();
    return email ? `login:${email}` : `login-ip:${ipKeyGenerator(req)}`;
  },

  handler: (req, res, next, options) => {
    res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
    return next(
      new RateLimitError(
        "Too many login attempts. Please try again later.",
      ),
    );
  },
});

export const signupEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),

  keyGenerator: (req) => {
    const email = req.body?.email?.toLowerCase();
    return email ? `signup:${email}` : `signup-ip:${ipKeyGenerator(req)}`;
  },

  handler: (req, res, next, options) => {
    res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
    return next(
      new RateLimitError(
        "Too many signup attempts. Please try again later.",
      ),
    );
  },
});

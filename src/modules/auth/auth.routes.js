import { Router } from "express";
import { loginController, signupController } from "./auth.controller.js";
import { loginValidator, signupValidator } from "./auth.validator.js";
import {
  loginEmailRateLimiter,
  signupEmailRateLimiter,
} from "../../middlewares/rateLimit.js";

const router = Router();

router.post("/login", loginEmailRateLimiter, loginValidator, loginController);
router.post("/signup", signupEmailRateLimiter, signupValidator, signupController);

export default router;
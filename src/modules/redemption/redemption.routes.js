import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  listRedemptions,
  getPromoUsageStats,
} from "./redemption.controller.js";
import {
  listRedemptionsValidator,
  promoUsageStatsValidator,
} from "./redemption.validator.js";

const router = Router();

router.get("/", authMiddleware(["admin"]), listRedemptionsValidator, listRedemptions);

router.get("/usage/:promoId", authMiddleware(["admin"]), promoUsageStatsValidator, getPromoUsageStats);

export default router;

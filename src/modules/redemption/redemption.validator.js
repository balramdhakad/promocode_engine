import { param, query } from "express-validator";
import { validateHandler } from "../../utils/expressValidator.js";

export const listRedemptionsValidator = [
  query("promoId")
    .optional()
    .isUUID()
    .withMessage("promoId must be a valid UUID."),
  query("userId")
    .optional()
    .isUUID()
    .withMessage("userId must be a valid UUID."),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive integer."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100."),
  validateHandler,
];

export const promoUsageStatsValidator = [
  param("promoId").isUUID().withMessage("promoId must be a valid UUID."),
  validateHandler,
];

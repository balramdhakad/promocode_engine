import { body, param } from "express-validator";
import { validateHandler } from "../../utils/expressValidator.js";

export const listWhitelistValidator = [
  param("promoId").isUUID().withMessage("Promo ID must be a valid UUID."),
  validateHandler,
];

export const addWhitelistUserValidator = [
  param("promoId").isUUID().withMessage("PromoId must be a valid id."),
  body("userId").isUUID().withMessage("userId must be a valid id."),
  validateHandler,
];

export const removeWhitelistUserValidator = [
  param("promoId").isUUID().withMessage("PromoId must be a valid id."),
  body("userId").isUUID().withMessage("userId must be a valid id."),
  validateHandler,
];

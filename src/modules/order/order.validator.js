import { body } from "express-validator";
import { validateHandler } from "../../utils/expressValidator.js";

export const placeOrderValidator = [
  body("orderAmount")
    .notEmpty()
    .withMessage("orderAmount is required.")
    .isFloat({ gt: 0 })
    .withMessage("orderAmount must be a positive number."),

  body("promoCode")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 50 })
    .withMessage("promoCode must be at most 50 characters."),

  validateHandler,
];

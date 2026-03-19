import { body, param, query } from "express-validator";
import { validateHandler } from "../../utils/expressValidator.js";

const DISCOUNT_TYPES = ["percentage", "fixed"];
const PROMO_TARGETS  = ["all", "new_users", "segment", "specific_users"];
const PROMO_STATUSES = ["active", "inactive", "expired", "exhausted", "superseded"];

const isHHmm = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

const getPromoValidatorChain = () => [
  body("code")
    .notEmpty()
    .withMessage("Code is required.")
    .isLength({ max: 50 })
    .withMessage("Code must be at most 50 characters.")
    .matches(/^[A-Z0-9]+$/i)
    .withMessage("Code may only contain letters and numbers."),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be a string."),

  body("discountType")
    .notEmpty()
    .withMessage("Discount type is required.")
    .isIn(DISCOUNT_TYPES)
    .withMessage(`Discount type must be one of: ${DISCOUNT_TYPES.join(", ")}.`),

  body("discountValue")
    .notEmpty()
    .withMessage("Discount value is required.")
    .isFloat({ gt: 0 })
    .withMessage("Discount value must be a positive number.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Discount value must have at most 2 decimal places.")
    .custom((value, { req }) => {
      if (req.body.discountType === "percentage" && parseFloat(value) > 100) {
        throw new Error("Percentage discount cannot exceed 100.");
      }
      return true;
    }),

  body("maxDiscountAmount")
    .optional({ nullable: true })
    .isFloat({ gt: 0 })
    .withMessage("Max discount amount must be a positive number.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Max discount amount must have at most 2 decimal places."),

  body("minOrderValue")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Min order value must be 0 or greater.")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Min order value must have at most 2 decimal places."),

  body("target")
    .optional()
    .isIn(PROMO_TARGETS)
    .withMessage(`Target must be one of: ${PROMO_TARGETS.join(", ")}.`),

  body("targetSegment")
    .optional({ nullable: true })
    .isString()
    .isLength({ max: 100 })
    .withMessage("Target segment must be at most 100 characters.")
    .custom((value, { req }) => {
      if (req.body.target === "segment" && !value) {
        throw new Error("Target segment is required when target is 'segment'.");
      }
      return true;
    }),

  body("maxUsageGlobal")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("Max global usage must be a positive integer."),

  body("maxUsagePerUser")
    .optional({ nullable: true })
    .isInt({ gt: 0 })
    .withMessage("Max usage per user must be a positive integer."),

  body("status")
    .optional()
    .isIn(PROMO_STATUSES)
    .withMessage(`Status must be one of: ${PROMO_STATUSES.join(", ")}.`),

  body("startsAt")
    .optional()
    .isISO8601()
    .withMessage("startsAt must be a valid ISO 8601 datetime."),

  body("expiresAt")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("expiresAt must be a valid ISO 8601 datetime.")
    .custom((value, { req }) => {
      if (value && req.body.startsAt) {
        if (new Date(value) <= new Date(req.body.startsAt)) {
          throw new Error("expiresAt must be after startsAt.");
        }
      }
      return true;
    }),

  body("dailyStartTime")
    .optional({ nullable: true })
    .custom((value) => {
      if (!isHHmm(value)) throw new Error("dailyStartTime must be in HH:mm format.");
      return true;
    }),

  body("dailyEndTime")
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (!isHHmm(value)) throw new Error("dailyEndTime must be in HH:mm format.");
      if (req.body.dailyStartTime) {
        const [sh, sm] = req.body.dailyStartTime.split(":").map(Number);
        const [eh, em] = value.split(":").map(Number);
        if (eh * 60 + em <= sh * 60 + sm) {
          throw new Error("dailyEndTime must be after dailyStartTime.");
        }
      }
      return true;
    })
    .custom((value, { req }) => {
      const hasStart = Boolean(req.body.dailyStartTime);
      const hasEnd   = Boolean(value);
      if (hasStart !== hasEnd) {
        throw new Error("dailyStartTime and dailyEndTime must both be provided together.");
      }
      return true;
    }),

  body("timezone")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Timezone must be at most 50 characters.")
    .custom((value) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: value });
      } catch {
        throw new Error(`'${value}' is not a valid IANA timezone.`);
      }
      return true;
    }),
];

const makeOptional = (validators) =>
  validators.map((validator) => {
    if (typeof validator.optional === "function") {
      return validator.optional({ nullable: true });
    }
    return validator;
  });

export const createPromoCodeValidator = [
  ...getPromoValidatorChain(),
  validateHandler,
];

export const updatePromoCodeValidator = [
  param("id").isUUID().withMessage("Promo code ID must be a valid UUID."),
  ...makeOptional(getPromoValidatorChain()),
  validateHandler,
];

export const promoIdParamValidator = [
  param("id").isUUID().withMessage("Promo ID must be a valid UUID."),
  validateHandler,
];

export const versionHistoryValidator = [
  param("code")
    .notEmpty()
    .withMessage("Code is required.")
    .isLength({ max: 50 })
    .withMessage("Code must be at most 50 characters.")
    .matches(/^[A-Z0-9]+$/i)
    .withMessage("Code may only contain letters and numbers."),
  validateHandler,
];

export const listPromosValidator = [
  query("status")
    .optional()
    .isIn(PROMO_STATUSES)
    .withMessage(`status must be one of: ${PROMO_STATUSES.join(", ")}.`),
  query("target")
    .optional()
    .isIn(PROMO_TARGETS)
    .withMessage(`target must be one of: ${PROMO_TARGETS.join(", ")}.`),
  query("code")
    .optional()
    .isLength({ max: 50 })
    .withMessage("code must be at most 50 characters."),
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

export const applyPromoCodeValidator = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Promo code is required.")
    .isLength({ max: 50 })
    .withMessage("Code must be at most 50 characters."),

  body("orderValue")
    .notEmpty()
    .withMessage("Order value is required.")
    .isFloat({ min: 0 })
    .withMessage("Order value must be a non-negative number."),

  validateHandler,
];
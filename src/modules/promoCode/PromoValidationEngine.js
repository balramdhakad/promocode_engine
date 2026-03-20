import { ValidationError } from "../../utils/errors.js";
import { DISCOUNT_TYPE, PROMO_STATUS, PROMO_TARGET } from "./PromoCode.constants.js";

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const getCurrentTimeInTimezone = (timezone) => {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone ?? "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
};

export const validatePromo = (promo, ctx) => {
  const now = new Date();

  if (promo.status !== PROMO_STATUS.ACTIVE) {
    throw new ValidationError("This promo code is not active.");
  }

  if (new Date(promo.startsAt) > now) {
    throw new ValidationError("This promo code is not active yet.");
  }

  if (promo.expiresAt && new Date(promo.expiresAt) < now) {
    throw new ValidationError("This promo code has expired.");
  }

  if (promo.dailyStartTime && promo.dailyEndTime) {
    const current = toMinutes(getCurrentTimeInTimezone(promo.timezone));
    const start = toMinutes(promo.dailyStartTime);
    const end = toMinutes(promo.dailyEndTime);

    if (current < start || current > end) {
      throw new ValidationError(`This promo is only valid between ${promo.dailyStartTime} and ${promo.dailyEndTime}.`);
    }
  }

  const minOrder = parseFloat(promo.minOrderValue);
  if (minOrder > 0 && ctx.orderValue < minOrder) {
    throw new ValidationError(`Minimum order value of ₹${promo.minOrderValue} is required.`);
  }

  if (promo.target === PROMO_TARGET.NEW_USERS && !ctx.isNewUser) {
    throw new ValidationError("This promo code is only valid for new users.");
  }

  if (promo.target === PROMO_TARGET.SEGMENT && ctx.userSegment !== promo.targetSegment) {
    throw new ValidationError("You are not eligible for this promo code.");
  }

  if (promo.target === PROMO_TARGET.WHITELIST && !ctx.isWhitelisted) {
    throw new ValidationError("You are not eligible for this promo code.");
  }

  if (promo.maxUsageGlobal !== null && ctx.globalCount >= promo.maxUsageGlobal) {
    throw new ValidationError("This promo code has reached its usage limit.");
  }

  if (promo.maxUsagePerUser !== null && ctx.userCount >= promo.maxUsagePerUser) {
    throw new ValidationError("You have already used this promo code the maximum number of times.");
  }

  const discountAmount = calculateDiscount(promo, ctx.orderValue);

  return {
    valid: true,
    promoId: promo.id,
    discountAmount,
    finalOrderValue: Math.max(0, ctx.orderValue - discountAmount),
  };
};

export const calculateDiscount = (promo, orderValue) => {
  const value = parseFloat(promo.discountValue);

  if (promo.discountType === DISCOUNT_TYPE.PERCENTAGE) {
    const discount = (value / 100) * orderValue;
    const cap = promo.maxDiscountAmount ? parseFloat(promo.maxDiscountAmount) : Infinity;
    return Math.min(discount, cap, orderValue);
  }

  return Math.min(value, orderValue);
};
export const DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
};

export const PROMO_TARGET = {
  ALL: "all",
  NEW_USERS: "new_users",
  SEGMENT: "segment",
  WHITELIST: "whitelist",
};

export const PROMO_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  EXPIRED: "expired",
  SUPERSEDED: "superseded",
};

export const VALIDATE_RESULT = {
  SUCCESS: "success",
  FAILED: "failed",
};

export const PROMO_ERROR = {
  NOT_FOUND: "PROMO_NOT_FOUND",
  INACTIVE: "PROMO_INACTIVE",
  EXPIRED: "PROMO_EXPIRED",
  NOT_STARTED: "PROMO_NOT_STARTED",
  OUTSIDE_TIME_WINDOW: "PROMO_OUTSIDE_TIME_WINDOW",
  MIN_ORDER_NOT_MET: "PROMO_MIN_ORDER_NOT_MET",
  GLOBAL_LIMIT_HIT: "PROMO_GLOBAL_LIMIT_HIT",
  USER_LIMIT_HIT: "PROMO_USER_LIMIT_HIT",
  TARGET_MISMATCH: "PROMO_TARGET_MISMATCH",
  NOT_WHITELISTED: "PROMO_NOT_WHITELISTED",
  ALREADY_DELETED: "PROMO_ALREADY_DELETED",
  CONFLICT: "PROMO_CODE_CONFLICT",
};

export const IMMUTABLE_FIELDS = [
  "code",
];

export const createAndUpdateAllowedFieldFromBody = [
  "code",
  "description",
  "discountType",
  "discountValue",
  "maxDiscountAmount",
  "minOrderValue",
  "target",
  "targetSegment",
  "maxUsageGlobal",
  "maxUsagePerUser",
  "expiresAt",
  "startsAt",
  "dailyStartTime",
  "dailyEndTime",
  "timezone",
];

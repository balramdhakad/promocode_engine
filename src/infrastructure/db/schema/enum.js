import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "banned",
]);


export const discountTypeEnum = pgEnum("discount_type", ["percentage", "flat"]);

export const promoStatusEnum = pgEnum("promo_status", [
  "active",
  "inactive",
  "expired",
  "exhausted",
]);

export const promoTargetEnum = pgEnum("promo_target", [
  "all",
  "specific_users",
  "new_users",
  "segment",
]);
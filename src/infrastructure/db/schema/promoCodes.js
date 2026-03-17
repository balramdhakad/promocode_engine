import {
  pgTable,
  text,
  varchar,
  numeric,
  integer,
  timestamp,
  uuid,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";
import { index } from "drizzle-orm/gel-core";
import { discountTypeEnum, promoStatusEnum, promoTargetEnum } from "./enum.js";
import { users } from "./user.js";
import { promoValidationLogs } from "./promoValidationLogs.js";
import { promoRedemptions } from "./promoRedemptions.js";
import { promoUserWhitelist } from "./promoUserWhitelist.js";
import { uuidv7 } from "../helpers/uuid.js";

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuidv7(),
    code: varchar("code", { length: 50 }).notNull().unique(),

    description: text("description"),

    discountType: discountTypeEnum("discount_type").notNull(),

    discountValue: numeric("discount_value", {
      precision: 10,
      scale: 2,
    }).notNull(),

    maxDiscountAmount: numeric("max_discount_amount", {
      precision: 10,
      scale: 2,
    }),

    minOrderValue: numeric("min_order_value", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default(0),

    target: promoTargetEnum("target").default("all").notNull(),
    targetSegment: varchar("target_segment", { length: 100 }),

    //null = unlimited
    maxUsageGlobal: integer("max_usage_global"),
    maxUsagePerUser: integer("max_usage_per_user"),

    status: promoStatusEnum("status").default("active").notNull(),
    //full timestamp with date
    startsAt: timestamp("starts_at").defaultNow().notNull(),
    //null = alive until deactivate
    expiresAt: timestamp("expires_at"),

    // "19:00" (HH:mm) - example this promocode valid from 7-11 pm daily null = no time ristriction
    dailyStartTime: varchar("daily_start_time", { length: 5 }),
    dailyEndTime: varchar("daily_end_time", { length: 5 }),
    timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata"),

    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    //most frequent query by user currently active code with current order value
    index("idx_promo_codes_active_min_discount_isactive")
      .on(t.discountValue, t.startsAt)
      .where(sql`status = 'active' AND expires_at > now()`),

    index("idx_promo_codes_active_codes").on(t.status),

    //for corn jobs to update status to exprire if expiresAt exceed
    index("idx_promo_codes_going_to_expire").on(t.expiresAt),

    uniqueIndex("idx_promo_codes_code").on(t.code),
  ],
);

export const promoCodesRelations = relations(promoCodes, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [promoCodes.createdBy],
    references: [users.id],
  }),
  whitelist: many(promoUserWhitelist),
  redemptions: many(promoRedemptions),
  validationLogs: many(promoValidationLogs),
}));

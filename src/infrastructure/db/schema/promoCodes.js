import {
  pgTable,
  text,
  varchar,
  numeric,
  integer,
  timestamp,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";
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
    code: varchar("code", { length: 50 }).notNull(),

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
      .default("0"),

    target: promoTargetEnum("target").default("all").notNull(),
    targetSegment: varchar("target_segment", { length: 100 }),

    maxUsageGlobal: integer("max_usage_global"),
    maxUsagePerUser: integer("max_usage_per_user"),

    status: promoStatusEnum("status").default("active").notNull(),
    startsAt: timestamp("starts_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),

    dailyStartTime: varchar("daily_start_time", { length: 5 }),
    dailyEndTime: varchar("daily_end_time", { length: 5 }),
    timezone: varchar("timezone", { length: 50 }).default("Asia/Kolkata"),

    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("idx_promo_codes_one_active_per_code")
      .on(t.code)
      .where(sql`status = 'active'`),

    index("idx_promo_codes_status").on(t.status),

    index("idx_promo_codes_expires_at").on(t.expiresAt),

    index("idx_promo_codes_code").on(t.code),

  ],
);

export const promoCodesRelations = relations(promoCodes, ({ one, many }) => ({
  creator: one(users, {
    fields: [promoCodes.createdBy],
    references: [users.id],
  }),

  whitelist: many(promoUserWhitelist),
  redemptions: many(promoRedemptions),
  validationLogs: many(promoValidationLogs),
}));

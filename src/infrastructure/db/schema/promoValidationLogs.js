import {
  pgTable,
  varchar,
  numeric,
  boolean,
  timestamp,
  primaryKey,
  uuid,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/gel-core";
import { users } from "./user.js";
import { promoCodes } from "./promoCodes.js";
import { uuidv7 } from "../helpers/uuid.js";

export const promoValidationLogs = pgTable(
  "promo_validation_logs",
  {
    id: uuidv7(),
    promoId: uuid("promo_id").references(() => promoCodes.id),
    code: varchar("code", { length: 50 }).notNull(),
    userId: uuid("user_id").references(() => users.id),
    orderAmount: numeric("order_amount", { precision: 10, scale: 2 }),
    isValid: boolean("is_valid").notNull(),
    // "invalid_code" | "inactive" | "expired" | "usage_limit_reached"
    failReason: varchar("fail_reason", { length: 100 }),
    checkedAt: timestamp("checked_at").defaultNow().notNull(),
  },
  (t) => [
    //how many times was this code attempted by a user?
    index("idx_val_logs_code").on(t.code, t.userId),

    // all attempts by a specific user
    index("idx_val_logs_user_id").on(t.userId),

    // filter by pass/fail
    index("idx_val_logs_is_valid").on(t.isValid),

  ],
);






export const promoValidationLogsRelations = relations(
  promoValidationLogs,
  ({ one }) => ({
    promo: one(promoCodes, {
      fields: [promoValidationLogs.promoId],
      references: [promoCodes.id],
    }),
    user: one(users, {
      fields: [promoValidationLogs.userId],
      references: [users.id],
    }),
  }),
);

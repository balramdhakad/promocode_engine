import {
  pgTable,
  numeric,uuid,
  timestamp,
  uniqueIndex

} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";
import { index } from "drizzle-orm/gel-core";
import { users } from "./user.js";
import { promoCodes } from "./promoCodes.js";
import { uuidv7 } from "../helpers/uuid.js";

export const promoRedemptions = pgTable(
  "promo_redemptions",
  {
    id: uuidv7(),
    promoId: uuid("promo_id")
      .notNull()
      .references(() => promoCodes.id),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    orderId: uuid("order_id").notNull(),

    discountApplied: numeric("discount_applied", {
      precision: 10,
      scale: 2,
    }).notNull(),

    redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
  },
  (t) => [
    // Global usage count
    index("idx_redemptions_promo_id").on(t.promoId),

    // Per-user usage count
    index("idx_redemptions_promo_user").on(t.promoId, t.userId),

    // All redemptions by a user
    index("idx_redemptions_user_id").on(t.userId),

    // Prevent double redemption on same order
    uniqueIndex("idx_redemptions_order_id").on(t.orderId),
  ],
);


export const promoRedemptionsRelations = relations(
  promoRedemptions,
  ({ one }) => ({
    promo: one(promoCodes, {
      fields: [promoRedemptions.promoId],
      references: [promoCodes.id],
    }),
    user: one(users, {
      fields: [promoRedemptions.userId],
      references: [users.id],
    }),
  }),
);
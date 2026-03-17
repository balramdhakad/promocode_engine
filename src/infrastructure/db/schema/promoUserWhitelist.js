import {
  pgTable,primaryKey,unique,uuid
} from "drizzle-orm/pg-core";

import { index } from "drizzle-orm/gel-core";
import { relations } from "drizzle-orm";
import { users } from "./user.js";
import { promoCodes } from "./promoCodes.js";
import { uuidv7 } from "../helpers/uuid.js";

export const promoUserWhitelist = pgTable(
  "promo_user_whitelist",
  {
    id: uuidv7(),
    promoId: uuid("promo_id")
      .notNull()
      .references(() => promoCodes.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
  },
  (t) => [
    // Enforce no duplicate (promo, user) pairs
    unique({ columns: [t.promoId, t.userId] }),

    //is this user is eligible(whitelisted) for this promocode
    index("idx_whitelist_promo_user").on(t.promoId, t.userId),

    // Which promos is this user whitelisted for?
    index("idx_whitelist_user_id").on(t.userId),
  ],
);


export const promoUserWhitelistRelations = relations(
  promoUserWhitelist,
  ({ one }) => ({
    promo: one(promoCodes, {
      fields: [promoUserWhitelist.promoId],
      references: [promoCodes.id],
    }),
    user: one(users, {
      fields: [promoUserWhitelist.userId],
      references: [users.id],
    }),
  }),
);
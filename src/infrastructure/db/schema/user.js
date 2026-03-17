import { uuidv7 } from "../helpers/uuid.js";
import { index, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum, userStatusEnum } from "./enum.js";
import { promoCodes } from "./promoCodes.js";
import { promoUserWhitelist } from "./promoUserWhitelist.js";
import { promoRedemptions } from "./promoRedemptions.js";
import { promoValidationLogs } from "./promoValidationLogs.js";

export const users = pgTable("users", {
  id:           uuidv7(),
  username:     varchar("username", { length: 255 }).notNull().unique(), // fixed: was "name"
  email:        varchar("email", { length: 255 }).notNull().unique(),
  phone:        varchar("phone", { length: 10 }).unique(),
  passwordHash: text("password_hash").notNull(),
  role:         userRoleEnum("role").default("customer").notNull(),
  status:       userStatusEnum("status").default("active").notNull(),

  firstOrderAt: timestamp("first_order_at"),
  segment:      varchar("segment", { length: 100 }),

  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),

}, (t) => [
  uniqueIndex("idx_users_email").on(t.email),
  uniqueIndex("idx_users_username").on(t.username),
  index("idx_users_status").on(t.status),
  index("idx_users_role").on(t.role),
]);

export const usersRelations = relations(users, ({ many }) => ({
  createdPromoCodes: many(promoCodes),
  promoWhitelist: many(promoUserWhitelist),
  promoRedemptions: many(promoRedemptions),
  promoValidationLogs: many(promoValidationLogs),
}));

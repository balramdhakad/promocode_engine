import { and, eq } from "drizzle-orm";
import { promoUserWhitelist } from "../../infrastructure/db/schema/index.js";

export const isUserWhitelisted = async (db, promoId, userId) => {
  const row = await db.query.promoUserWhitelist.findFirst({
    where: and(
      eq(promoUserWhitelist.promoId, promoId),
      eq(promoUserWhitelist.userId, userId),
    ),
  });
  return Boolean(row);
};

export const addWhitelistUser = async (db, promoId, userId) => {
  const [row] = await db
    .insert(promoUserWhitelist)
    .values({ promoId, userId })
    .onConflictDoNothing()
    .returning();
  return row;
};

export const removeWhitelistUser = async (db, promoId, userId) => {
  const [row] = await db
    .delete(promoUserWhitelist)
    .where(
      and(
        eq(promoUserWhitelist.promoId, promoId),
        eq(promoUserWhitelist.userId, userId),
      ),
    )
    .returning();
  return row;
};

export const listWhitelistUsers = (db, promoId) =>
  db.query.promoUserWhitelist.findMany({
    where: eq(promoUserWhitelist.promoId, promoId),
    with: { user: { columns: { id: true, username: true, email: true } } },
  });

import { and, count, countDistinct, eq, desc } from "drizzle-orm";
import { promoRedemptions, promoCodes } from "../../infrastructure/db/schema/index.js";

export const logRedeem = async (db, { promoId, code, userId, orderId, discountApplied }) => {
  const [row] = await db
    .insert(promoRedemptions)
    .values({ promoId, code, userId, orderId, discountApplied })
    .returning();
  return row;
};

export const hasOrderBeenRedeemed = async (db, orderId) => {
  const row = await db.query.promoRedemptions.findFirst({
    where: eq(promoRedemptions.orderId, orderId),
  });
  return row ?? null;
};

export const getGlobalRedeemCount = async (db, code) => {
  const [{ total }] = await db
    .select({ total: count() })
    .from(promoRedemptions)
    .where(eq(promoRedemptions.code, code));
  return Number(total);
};

export const getUserRedeemCount = async (db, code, userId) => {
  const [{ total }] = await db
    .select({ total: count() })
    .from(promoRedemptions)
    .where(
      and(
        eq(promoRedemptions.code, code),
        eq(promoRedemptions.userId, userId),
      ),
    );
  return Number(total);
};

export const listRedemptions = async (db, { where, limit, offset, page }) => {
  const [rows, [{ total }]] = await Promise.all([
    db.query.promoRedemptions.findMany({
      where,
      limit,
      offset,
      orderBy: (t, { desc }) => [desc(t.redeemedAt)],
      with: {
        promo: { columns: { id: true, code: true } },
        user: { columns: { id: true, email: true } },
      },
    }),
    db.select({ total: count() }).from(promoRedemptions).where(where),
  ]);

  return {
    data: rows || [],
    pagination: { total: Number(total), page, limit },
  };
};

export const getPromoUsageStats = async (db, code) => {
  const [{ total }] = await db
    .select({ total: count() })
    .from(promoRedemptions)
    .where(eq(promoRedemptions.code, code));

  const [{ uniqueUsers }] = await db
    .select({ uniqueUsers: countDistinct(promoRedemptions.userId) })
    .from(promoRedemptions)
    .where(eq(promoRedemptions.code, code));

  const recent = await db.query.promoRedemptions.findMany({
    where: eq(promoRedemptions.code, code),
    orderBy: (t, { desc }) => [desc(t.redeemedAt)],
    limit: 10,
    with: { user: { columns: { id: true, email: true } } },
  });

  return {
    totalRedemptions: Number(total),
    uniqueUsers: Number(uniqueUsers),
    recentRedemptions: recent,
  };
};


import { eq, sql, and, lt, gt, gte, isNull, isNotNull, or, count } from "drizzle-orm";
import { promoCodes } from "../../infrastructure/db/schema/index.js";
import { promoUserWhitelist } from "../../infrastructure/db/schema/index.js";
import { promoRedemptions } from "../../infrastructure/db/schema/index.js";
import { promoValidationLogs } from "../../infrastructure/db/schema/index.js";
import { PROMO_STATUS } from "./PromoCode.constants.js";


export const findByCode = (db, code) =>
  db.query.promoCodes.findFirst({
    where: eq(promoCodes.code, code),
  });

export const findActiveByCode = (db, code) =>
  db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.code, code),
      eq(promoCodes.status, PROMO_STATUS.ACTIVE),
      isNull(promoCodes.supersededBy),
      or(
        isNull(promoCodes.expiresAt),
        gt(promoCodes.expiresAt, sql`now()`),
      ),
    ),
  });


export const findById = (db, id) =>
  db.query.promoCodes.findFirst({
    where: eq(promoCodes.id, id),
  });


export const findCurrentVersionById = (db, id) =>
  db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.id, id),
      isNull(promoCodes.supersededBy),
    ),
  });


export const findVersionHistory = (db, code) =>
  db.query.promoCodes.findMany({
    where: eq(promoCodes.code, code),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });


export const listPromos = async (db, filters = {}) => {
  const { status, target,code, page = 1, limit = 20, includeSuperseded = false } = filters;

  const conditions = [];
  if(search) conditions.push(eq(promoCodes.code, code))
  if (status) conditions.push(eq(promoCodes.status, status));
  if (target) conditions.push(eq(promoCodes.target, target));
  if (!includeSuperseded) conditions.push(isNull(promoCodes.supersededBy));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [rows, [{ total }]] = await Promise.all([
    db.query.promoCodes.findMany({
      where,
      limit,
      offset,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    }),
    db.select({ total: count() }).from(promoCodes).where(where),
  ]);

  return { rows, total: Number(total), page, limit };
};


export const createPromo = async (db, data) => {
    console.log(data)
  const [row] = await db.insert(promoCodes).values(data).returning();
  return row;
};


export const createNewVersion = async (tx, oldRow, updateData) => {

  const {
    id: _id,
    createdAt: _ca,
    updatedAt: _ua,
    supersededBy: _sb,
    ...rowData
  } = oldRow;

  const [newRow] = await tx
    .insert(promoCodes)
    .values({
      ...rowData,      
      ...updateData,   
      supersededBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  await tx
    .update(promoCodes)
    .set({
      status: PROMO_STATUS.SUPERSEDED,
      supersededBy: newRow.id,
      updatedAt: new Date(),
    })
    .where(eq(promoCodes.id, oldRow.id));

  return newRow;
};

export const deactivatePromo = async (db, id) => {
  const [row] = await db
    .update(promoCodes)
    .set({ status: PROMO_STATUS.INACTIVE, updatedAt: new Date() })
    .where(
      and(
        eq(promoCodes.id, id),
        isNull(promoCodes.supersededBy),
      ),
    )
    .returning();
  return row ?? null;
};


export const bulkExpire = async (db) => {
  const result = await db
    .update(promoCodes)
    .set({ status: PROMO_STATUS.EXPIRED, updatedAt: new Date() })
    .where(
      and(
        eq(promoCodes.status, PROMO_STATUS.ACTIVE),
        isNull(promoCodes.supersededBy),
        lt(promoCodes.expiresAt, sql`now()`),
      ),
    );
  return result.rowCount ?? 0;
};


export const findExpiringWithin = (db, hours = 24) =>
  db.query.promoCodes.findMany({
    where: and(
      eq(promoCodes.status, PROMO_STATUS.ACTIVE),
      isNull(promoCodes.supersededBy),
      isNotNull(promoCodes.expiresAt),
      gte(promoCodes.expiresAt, sql`now()`),
      lt(promoCodes.expiresAt, sql`now() + interval '${sql.raw(String(hours))} hours'`),
    ),
  });


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

export const getGlobalRedeemCount = async (db, promoId) => {
  const [{ total }] = await db
    .select({ total: count() })
    .from(promoRedemptions)
    .where(eq(promoRedemptions.promoId, promoId));
  return Number(total);
};

export const getUserRedeemCount = async (db, promoId, userId) => {
  const [{ total }] = await db
    .select({ total: count() })
    .from(promoRedemptions)
    .where(
      and(
        eq(promoRedemptions.promoId, promoId),
        eq(promoRedemptions.userId, userId),
      ),
    );
  return Number(total);
};

export const hasOrderBeenRedeemed = async (db, promoId, orderId) => {
  const row = await db.query.promoRedemptions.findFirst({
    where: and(
      eq(promoRedemptions.promoId, promoId),
      eq(promoRedemptions.orderId, orderId),
    ),
  });
  return row ?? null;
};

export const logRedeem = async (db, { promoId, userId, orderId, discountApplied }) => {
  const [row] = await db
    .insert(promoRedemptions)
    .values({ promoId, userId, orderId, discountApplied })
    .returning();
  return row;
};

export const logValidation = async (db, payload) => {
  const [row] = await db
    .insert(promoValidationLogs)
    .values(payload)
    .returning();
  return row;
};


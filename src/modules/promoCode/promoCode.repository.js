import {eq,sql,and, lt, gte,isNull,isNotNull, or,count} from "drizzle-orm";
import {
  promoCodes,
  users,
  promoValidationLogs,
} from "../../infrastructure/db/schema/index.js";
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
      or(isNull(promoCodes.expiresAt), gte(promoCodes.expiresAt, sql`now()`)),
    ),
  });

export const findById = (db, id) =>
  db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.id, id),
      eq(promoCodes.status, PROMO_STATUS.ACTIVE),
    ),
  });
export const findByIdAny = (db, id) =>
  db.query.promoCodes.findFirst({
    where: and(eq(promoCodes.id, id)),
  });

export const findCurrentVersionById = (db, id) =>
  db.query.promoCodes.findFirst({
    where: and(
      eq(promoCodes.id, id),
      eq(promoCodes.status, PROMO_STATUS.ACTIVE),
    ),
    columns: {
      code: true,
      description: true,
      discountType: true,
      discountValue: true,
      maxDiscountAmount: true,
      minOrderValue: true,
      target: true,
      targetSegment: true,
      maxUsageGlobal: true,
      maxUsagePerUser: true,
      startsAt: true,
      expiresAt: true,
      dailyStartTime: true,
      dailyEndTime: true,
      timezone: true,
    },
  });

export const findVersionHistory = (db, code) =>
  db.query.promoCodes.findMany({
    where: eq(promoCodes.code, code),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

export const listPromos = async (db, { where, limit, offset, page }) => {
  const [rows, [{ total }]] = await Promise.all([
    db.query.promoCodes.findMany({
      where,
      limit,
      offset,
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    }),
    db.select({ total: count() }).from(promoCodes).where(where),
  ]);

  return {
    data: rows || [],
    pagination: { total: Number(total), page, limit },
  };
};

export const createPromo = async (db, data) => {
  const [row] = await db.insert(promoCodes).values(data).returning();
  return row;
};

export const createNewVersion = async (tx, id, data) => {
  const [oldRow] = await tx
    .update(promoCodes)
    .set({
      status: PROMO_STATUS.SUPERSEDED,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(promoCodes.id, id),
        or(
          eq(promoCodes.status, PROMO_STATUS.ACTIVE),
          eq(promoCodes.status, PROMO_STATUS.EXPIRED),
        ),
      ),
    )
    .returning();

  if (!oldRow) return null;

  const updatedField = {
    code: oldRow.code,
    description: data.description ?? oldRow.description,
    discountType: data.discountType ?? oldRow.discountType,
    discountValue: data.discountValue ?? oldRow.discountValue,
    maxDiscountAmount: data.maxDiscountAmount ?? oldRow.maxDiscountAmount,
    minOrderValue: data.minOrderValue ?? oldRow.minOrderValue,
    target: data.target ?? oldRow.target,
    targetSegment: data.targetSegment ?? oldRow.targetSegment,
    maxUsageGlobal: data.maxUsageGlobal ?? oldRow.maxUsageGlobal,
    maxUsagePerUser: data.maxUsagePerUser ?? oldRow.maxUsagePerUser,
    expiresAt: data.expiresAt ?? oldRow.expiresAt,
    startsAt: data.startsAt ?? oldRow.startsAt,
    dailyStartTime: data.dailyStartTime ?? oldRow.dailyStartTime,
    dailyEndTime: data.dailyEndTime ?? oldRow.dailyEndTime,
    timezone: data.timezone ?? oldRow.timezone,
    status: PROMO_STATUS.ACTIVE,
    updatedAt: new Date(),
    createdBy: data.createdBy,
  };

  const [newRow] = await tx
    .insert(promoCodes)
    .values({
      ...updatedField,
    })
    .returning();

  return newRow;
};

export const deactivatePromo = async (db, id) => {
  const [row] = await db
    .update(promoCodes)
    .set({ status: PROMO_STATUS.INACTIVE, updatedAt: new Date() })
    .where(
      and(eq(promoCodes.id, id), eq(promoCodes.status, PROMO_STATUS.ACTIVE)),
    )
    .returning();
  return row ?? null;
};




export const logValidation = async (db, payload) => {
  let { userId, code, orderAmount, isValid, promoId, failReason } = payload;

  const [row] = await db
    .insert(promoValidationLogs)
    .values({ userId, code, orderAmount, isValid, promoId, failReason })
    .returning();
  return row;
};

//find user Details
export const findUserById = (db, userId) =>
  db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      segment: true,
      firstOrderAt: true,
    },
  });

export const markFirstOrderIfNeeded = (db, userId) =>
  db
    .update(users)
    .set({ firstOrderAt: new Date(), updatedAt: new Date() })
    .where(and(eq(users.id, userId), isNull(users.firstOrderAt)))
    .returning();

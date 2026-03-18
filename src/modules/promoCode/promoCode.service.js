import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../utils/errors.js";

import * as repo from "./promoCode.repository.js";
import { PROMO_STATUS } from "./PromoCode.constants.js";
import { count } from "drizzle-orm";
import { promoCodes } from "../../infrastructure/db/schema/promoCodes.js";

export const createPromo = async (db, data, adminId) => {
  const existing = await repo.findByCode(db, data.code);
  if (existing) {
    throw new ConflictError(
      "promocode already exist please choose different code",
    );
  }

  const toDate = (value) => (value ? new Date(value) : undefined);

  const promo = await repo.createPromo(db, {
    ...data,
    startsAt: toDate(data.startsAt),
    expiresAt: toDate(data.expiresAt),
    createdBy: adminId,
  });

  return promo;
};

export const getVersionHistory = async (db, code) => {
  const history = await repo.findVersionHistory(db, code);
  if (!history.length) {
    throw new NotFoundError(`No promo found with code ${code}.`);
  }
  return history;
};

//deactivate
export const deActivatePromo = async (db, id) => {
  const promo = await repo.findById(db, id);

  if (!promo) {
    throw new NotFoundError("Promo code not found.");
  }

  if (promo.status === PROMO_STATUS.INACTIVE) {
    throw new BadRequestError("Promo code is already deactivated.");
  }

  if (promo.supersededBy !== null) {
    throw new ConflictError(
      "Cannot deactivate a superseded (old version) promo. Deactivate the current version instead.",
    );
  }

  const updated = await repo.deactivatePromo(db, id);

  if (!updated) {
    throw new ConflictError(
      "Promo could not be deactivated. It may have already been updated or deleted.",
    );
  }

  return updated;
};

export const listPromos = async (db, filters = {}) => {
  const { status, target, page = 1, limit = 20, code } = filters;

  const conditions = [];
  if (status) conditions.push(eq(promoCodes.status, status));
  if (code) conditions.push(eq(promoCodes.code, code));
  if (target) conditions.push(eq(promoCodes.target, target));

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

  return { data : rows, pagination :  {total: Number(total), page, limit} };
};

export const updatePromo = async (db, id, data, adminId) => {
  const current = await repo.findCurrentVersionById(db, id);

  if (!current) {
    throw new NotFoundError("Promo code not found.");
  }

  if (current.status === PROMO_STATUS.INACTIVE) {
    throw new BadRequestError("Cannot update a deactivated promo code.");
  }

  if (Object.keys(data).length === 0) {
    throw new BadRequestError("No updatable fields provided.");
  }

  const newVersion = await db.transaction(async (tx) => {
    return repo.createNewVersion(tx, current, {
      ...data,
      createdBy: adminId,
    });
  });

  return newVersion;
};


export const getPromoById = () => {
    
} 
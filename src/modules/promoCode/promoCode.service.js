import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../utils/errors.js";

import * as repo from "./promoCode.repository.js";
import * as whitelistRepo from "../whitelist/whitelist.repository.js";
import * as redemptionRepo from "../redemption/redemption.repository.js";
import {
  PROMO_STATUS,
  PROMO_TARGET,
  VALIDATE_RESULT,
} from "./PromoCode.constants.js";
import { and, count, eq } from "drizzle-orm";
import { promoCodes } from "../../infrastructure/db/schema/promoCodes.js";
import { toDate } from "./helper.js";
import { validatePromo } from "./PromoValidationEngine.js";

export const createPromo = async (db, data, adminId) => {
  const existing = await repo.findByCode(db, data.code);
  if (existing) {
    throw new ConflictError(
      "promocode already exist please choose different code",
    );
  }

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

  if (promo.status !== PROMO_STATUS.ACTIVE) {
    throw new BadRequestError("Promo code is already deactivated.");
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

  const result = await repo.listPromos(db, { where, limit, offset, page });
  return result;
};

export const updatePromo = async (db, id, data, adminId) => {
  if (Object.keys(data).length === 0) {
    throw new BadRequestError("No updatable fields provided.");
  }

  const newVersion = await db.transaction(async (tx) => {
    return repo.createNewVersion(tx, id, {
      ...data,
      startsAt: data.startsAt ? toDate(data.startsAt) : undefined,
      expiresAt: data.expiresAt ? toDate(data.expiresAt) : undefined,
      createdBy: adminId,
    });
  });

  if (!newVersion) {
    throw new NotFoundError("Promo code not found or cannot be updated.");
  }

  return newVersion;
};

export const getPromoById = async (db, id) => {
  const promoCodeDetails = await repo.findCurrentVersionById(db, id);
  if (!promoCodeDetails) {
    throw new NotFoundError("Promocode Details Not Found");
  }

  return promoCodeDetails;
};

//validate Promocode

export const validatePromoCode = async (db, { code, userId, orderValue }) => {
  if (!Number.isFinite(orderValue) || orderValue < 0) {
    throw new BadRequestError("orderValue must be a valid non-negative number.");
  }

  const promo = await repo.findActiveByCode(db, code);

  const logPayload = {
    promoId: promo?.id ?? null,
    userId,
    code,
    orderAmount: orderValue,
  };

  try {
    if (!promo) throw new NotFoundError("Promo code not found.");

    const user =
      promo.maxUsagePerUser || promo.target !== PROMO_TARGET.ALL
        ? await repo.findUserById(db, userId)
        : null;

    const [globalCount, userCount, isWhitelisted] = await Promise.all([
      promo.maxUsageGlobal ? redemptionRepo.getGlobalRedeemCount(db, promo.id) : 0,
      promo.maxUsagePerUser ? redemptionRepo.getUserRedeemCount(db, promo.id, userId) : 0,
      promo.target === PROMO_TARGET.WHITELIST
        ? whitelistRepo.isUserWhitelisted(db, promo.id, userId)
        : false,
    ]);

    const result = validatePromo(promo, {
      userId,
      orderValue,
      isNewUser: user ? !user.firstOrderAt : false,
      userSegment: user?.segment ?? null,
      isWhitelisted,
      globalCount,
      userCount,
    });

    await repo.logValidation(db, {
      ...logPayload,
      isValid:true,
      failReason: null,
    });

    return result;
  } catch (err) {
    await repo.logValidation(db, {
      ...logPayload,
      isValid: false,
      failReason: err.message,
    });
    throw err;
  }
};

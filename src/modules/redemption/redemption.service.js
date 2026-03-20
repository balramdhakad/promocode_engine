import { NotFoundError } from "../../utils/errors.js";
import * as repo from "./redemption.repository.js";
import * as promoRepo from "../promoCode/promoCode.repository.js";
import { and, eq } from "drizzle-orm";
import { promoRedemptions } from "../../infrastructure/db/schema/index.js";

export const listRedemptions = async (db, filters = {}) => {
  const { promoId, userId, code, page = 1, limit = 20 } = filters;

  const conditions = [];
  if (promoId) conditions.push(eq(promoRedemptions.promoId, promoId));
  if (userId)  conditions.push(eq(promoRedemptions.userId, userId));
  if (code)    conditions.push(eq(promoRedemptions.code, code));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  return repo.listRedemptions(db, { where, limit, offset, page });
};

export const getPromoUsageStats = async (db, code) => {
  const promo = await promoRepo.findActiveByCode(db, code);
  if (!promo) throw new NotFoundError("Promo code not found.");

  const stats = await repo.getPromoUsageStats(db, code);

  return {
    code,
    promoId: promo.id,
    maxUsageGlobal: promo.maxUsageGlobal ?? null,
    remainingUsage: promo.maxUsageGlobal
      ? Math.max(0, promo.maxUsageGlobal - stats.totalRedemptions)
      : null,
    ...stats,
  };
};

import { randomUUID } from "crypto";
import { BadRequestError } from "../../utils/errors.js";
import { validatePromoCode } from "../promoCode/promoCode.service.js";
import * as redemptionRepo from "../redemption/redemption.repository.js";
import { markFirstOrderIfNeeded } from "../promoCode/promoCode.repository.js";

export const placeOrder = async (db, { userId, orderAmount, promoCode }) => {
  if (!Number.isFinite(orderAmount) || orderAmount <= 0) {
    throw new BadRequestError("orderAmount must be a positive number.");
  }

  const orderId = randomUUID();
  let discountAmount = 0;
  let promoResult = null;

  if (promoCode) {
    promoResult = await validatePromoCode(db, {
      code: promoCode,
      userId,
      orderValue: orderAmount,
    });
    discountAmount = promoResult.discountAmount;
  }

  await db.transaction(async (tx) => {
    if (promoResult) {
      await redemptionRepo.logRedeem(tx, {
        promoId: promoResult.promoId,
        code: promoCode,
        userId,
        orderId,
        discountApplied: discountAmount,
      });
    }
    await markFirstOrderIfNeeded(tx, userId);
  });

  return {
    orderId,
    orderAmount,
    discountAmount,
    finalAmount: Math.max(0, orderAmount - discountAmount),
    promoApplied: promoCode ?? null,
    promoId: promoResult?.promoId ?? null,
  };
};

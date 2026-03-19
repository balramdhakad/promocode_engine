import { db } from "../../infrastructure/db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import * as orderService from "./order.service.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const { orderAmount, promoCode } = req.body;

  const result = await orderService.placeOrder(db, {
    userId: req.user.id,
    orderAmount: Number(orderAmount),
    promoCode: promoCode ?? null,
  });

  sendResponse(res, { statusCode: 201, message: "Order placed successfully.", data: result });
});

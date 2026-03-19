import { db } from "../../infrastructure/db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, sendResponseWithPagination } from "../../utils/response.js";
import * as redemptionService from "./redemption.service.js";

export const listRedemptions = asyncHandler(async (req, res) => {
  const { promoId, userId, page=1, limit=20 } = req.query;

  const { data, pagination } = await redemptionService.listRedemptions(db, {
    promoId,
    userId,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  console.log(pagination)

  sendResponseWithPagination(res, { data, pagination });
});

export const getPromoUsageStats = asyncHandler(async (req, res) => {
  const { promoId } = req.params;

  const stats = await redemptionService.getPromoUsageStats(db, promoId);

  sendResponse(res, { message: "Usage stats fetched.", data: stats });
});

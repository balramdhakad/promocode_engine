import { db } from "../../infrastructure/db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse, sendResponseWithPagination } from "../../utils/response.js";
import * as redemptionService from "./redemption.service.js";

export const listRedemptions = asyncHandler(async (req, res) => {
  const { promoId, userId, code, page = 1, limit = 20 } = req.query;

  const { data, pagination } = await redemptionService.listRedemptions(db, {
    promoId,
    userId,
    code,
    page: Number(page),
    limit: Number(limit),
  });

  sendResponseWithPagination(res, { data, pagination });
});

export const getPromoUsageStats = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const stats = await redemptionService.getPromoUsageStats(db, code);

  sendResponse(res, { message: "Usage stats fetched.", data: stats });
});

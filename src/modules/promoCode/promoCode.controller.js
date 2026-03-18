import { db } from "../../infrastructure/db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  sendResponse,
  sendResponseWithPagination,
} from "../../utils/response.js";
import { requestBodyExtractor } from "./helper.js";
import { createAndUpdateAllowedFieldFromBody } from "./PromoCode.constants.js";
import * as promoCodeService from "./promoCode.service.js";

export const createPromo = asyncHandler(async (req, res) => {

  const params = requestBodyExtractor(
    req.body,
    createAndUpdateAllowedFieldFromBody,
  );

  const userId = req.user.id

  const result = await promoCodeService.createPromo(db,params,userId);

  sendResponse(res, {
    statusCode: 201,
    message: "promocode has been created",
    data: result,
  });
});

export const updatePromo = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;


  const params = requestBodyExtractor(
    req.body,
    createAndUpdateAllowedFieldFromBody,
  );

  const newVersion = await promoCodeService.updatePromo(db, id, params, userId);

  sendResponse(res, {
    message: "Promocode Update successfully",
    data: newVersion,
  });
});

export const listPromos = async (req, res) => {
  const { status, target, page, limit, includeSuperseded , code} = req.query;

  const { data, pagination } = await promoCodeService.listPromos(db, {
    status,
    target,
    code,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    includeSuperseded: includeSuperseded === "true",
  });

  //rows, total: Number(total), page, limit
  sendResponseWithPagination(res, { data , pagination });
};

export const getPromoById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promo = await promoCodeService.getPromoById(db, id);

  sendResponse(res, {
    message: "Promocode details fetched",
    data: promo,
  });
});

export const getVersionHistory = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const history = await promoCodeService.getVersionHistory(db, code);

  sendResponse(res, {
    message: "Promocode version history fetched ",
    data: history,
  });
});

export const deActivatePromo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const promo = await promoCodeService.deActivatePromo(db, id);

  sendResponse(res, {
    message: "Promocode Deleted",
    data: promo,
  });
});

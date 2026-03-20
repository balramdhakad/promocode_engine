import { db } from "../../infrastructure/db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  sendResponse,
  sendResponseWithPagination,
} from "../../utils/response.js";
import { requestBodyExtractor } from "./helper.js";
import { createAllowedFieldFromBody, PROMO_STATUS, UpdateAllowedFieldFromBody } from "./PromoCode.constants.js";
import * as promoCodeService from "./promoCode.service.js";

export const createPromo = asyncHandler(async (req, res) => {

  const params = requestBodyExtractor(
    req.body,
    createAllowedFieldFromBody,
  );

  const userId = req.user.id;

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
    UpdateAllowedFieldFromBody,
  );

  const newVersion = await promoCodeService.updatePromo(db, id, params, userId);

  sendResponse(res, {
    message: "Promocode Update successfully",
    data: newVersion,
  });
});

export const listPromos = asyncHandler(async (req, res) => {
  const { status = PROMO_STATUS.ACTIVE, target, page, limit, code } = req.query;

  const { data, pagination } = await promoCodeService.listPromos(db, {
    status,
    target,
    
    code,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  sendResponseWithPagination(res, { data, pagination });
});

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


export const validatePromoCode = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  const result = await promoCodeService.validatePromoCode(db, {
    code,
    userId: req.user.id,
    orderValue: Number(orderValue),
  });

  sendResponse(res, { message: "Promo code is valid.", data: result });
});

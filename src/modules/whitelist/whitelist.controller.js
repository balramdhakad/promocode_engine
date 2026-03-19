import { db } from "../../infrastructure/db/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import * as whitelistService from "./whitelist.service.js";

export const addWhitelistUser = asyncHandler(async (req, res) => {
  const { promoId } = req.params;
  const { userId } = req.body;

  const row = await whitelistService.addWhitelistUser(db, promoId, userId);

  sendResponse(res, {
    statusCode: 201,
    message: "User added to whitelist.",
    data: row,
  });
});

export const removeWhitelistUser = asyncHandler(async (req, res) => {
  const { promoId } = req.params;
  const { userId } = req.body;
  const row = await whitelistService.removeWhitelistUser(db, promoId, userId);

  sendResponse(res, { message: "User removed from whitelist.", data: row });
});

export const listWhitelistUsers = asyncHandler(async (req, res) => {
  const { promoId } = req.params;

  const users = await whitelistService.listWhitelistUsers(db, promoId);

  sendResponse(res, { message: "Whitelist users fetched.", data: users });
});

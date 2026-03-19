import { ConflictError, NotFoundError } from "../../utils/errors.js";
import * as repo from "./whitelist.repository.js";
import * as promoRepo from "../promoCode/promoCode.repository.js";

export const addWhitelistUser = async (db, promoId, userId) => {
  const promo = await promoRepo.findById(db, promoId);
  if (!promo) throw new NotFoundError("Promo code not found.");

  const user = await promoRepo.findUserById(db, userId);
  if (!user) throw new NotFoundError("User not found.");

  const row = await repo.addWhitelistUser(db, promoId, userId);
  if (!row) throw new ConflictError("User is already whitelisted for this promo.");
  return row;
};

export const removeWhitelistUser = async (db, promoId, userId) => {
  const promo = await promoRepo.findById(db, promoId);
  if (!promo) throw new NotFoundError("Promo code not found.");

  const row = await repo.removeWhitelistUser(db, promoId, userId);
  if (!row) throw new NotFoundError("User is not whitelisted for this promo.");
  return row;
};

export const listWhitelistUsers = async (db, promoId) => {
  const promo = await promoRepo.findById(db, promoId);
  if (!promo) throw new NotFoundError("Promo code not found.");

  return repo.listWhitelistUsers(db, promoId);
};

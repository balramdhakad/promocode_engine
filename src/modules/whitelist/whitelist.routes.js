import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import {
  addWhitelistUser,
  removeWhitelistUser,
  listWhitelistUsers,
} from "./whitelist.controller.js";
import {
  listWhitelistValidator,
  addWhitelistUserValidator,
  removeWhitelistUserValidator,
} from "./whitelist.validator.js";

const router = Router();

router.get("/:promoId", authMiddleware(["admin"]), listWhitelistValidator, listWhitelistUsers);
router.post("/:promoId", authMiddleware(["admin"]), addWhitelistUserValidator, addWhitelistUser);
router.delete("/:promoId", authMiddleware(["admin"]), removeWhitelistUserValidator, removeWhitelistUser);

export default router;

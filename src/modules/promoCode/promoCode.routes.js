import { Router } from "express";
import {
  applyPromoCodeValidator,
  createPromoCodeValidator,
  updatePromoCodeValidator,
  promoIdParamValidator,
  versionHistoryValidator,
  listPromosValidator,
} from "./promoCodeValidator.js";
import {
  createPromo,
  deActivatePromo,
  getPromoById,
  getVersionHistory,
  listPromos,
  updatePromo,
  validatePromoCode,
} from "./promoCode.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware(["admin"]),
  createPromoCodeValidator,
  createPromo,
);

router.get("/", authMiddleware(["admin"]), listPromosValidator, listPromos);
router.get("/:id", authMiddleware(["admin"]), promoIdParamValidator, getPromoById);

router.patch(
  "/:id",
  authMiddleware(["admin"]),
  updatePromoCodeValidator,
  updatePromo,
);

router.delete("/:id", authMiddleware(["admin"]), promoIdParamValidator, deActivatePromo);

router.get("/:code/history", authMiddleware(["admin"]), versionHistoryValidator, getVersionHistory);

router.post(
  "/validate",
  authMiddleware(["customer", "admin"]),
  applyPromoCodeValidator,
  validatePromoCode,
);

export default router;

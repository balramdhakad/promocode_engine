import { Router } from "express";
import { createPromoCodeValidator, updatePromoCodeValidator } from "./promoCodeValidator.js";
import {
  createPromo,
  deActivatePromo,
  getPromoById,
  getVersionHistory,
  listPromos,
  updatePromo,
} from "./promoCode.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/",
  authMiddleware(["admin"]),
  createPromoCodeValidator,
  createPromo,
);

router.get("/", authMiddleware(["admin"]), listPromos);
router.get("/:id", authMiddleware(["admin"]), getPromoById);
router.patch(
  "/:id",
   authMiddleware(["admin"]),
  updatePromoCodeValidator,
  updatePromo,
);
router.delete("/:id", authMiddleware(["admin"]), deActivatePromo);

router.get("/:code/history", authMiddleware(["admin"]), getVersionHistory);

export default router;

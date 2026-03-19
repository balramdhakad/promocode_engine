import { Router } from "express";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { placeOrder } from "./order.controller.js";
import { placeOrderValidator } from "./order.validator.js";

const router = Router();

router.post(
  "/",
  authMiddleware(["customer", "admin"]),
  placeOrderValidator,
  placeOrder,
);

export default router;

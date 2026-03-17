import { Router } from "express";
import { loginController, signupController } from "./auth.controller.js";

const router = Router()

router.post("/login" , loginController)
router.post("/signup" , signupController)

export default router
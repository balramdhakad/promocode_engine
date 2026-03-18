import authService from "./auth.service.js";
import { sendResponse } from "../../utils/response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginService(email, password);

  sendResponse(res, {
    statusCode: 200,
    data: result,
    message: "User logged in successfully",
  });
});

export const signupController = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  const result = await authService.signupService(username, password, email);

  sendResponse(res, {
    statusCode: 201,
    data: result,
    message: "User signed up successfully",
  });
});

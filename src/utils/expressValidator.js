import { validationResult } from "express-validator";
import { ValidationError } from "./errors.js";

export const validateHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array();
    return next(new ValidationError(errors[0].msg, errors));
  }

  next();
};
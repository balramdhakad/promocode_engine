import { verifyToken } from "../utils/token.js";
import { ForbiddenError, UnAuthorisedError } from "../utils/errors.js";
import authRepository from "../modules/auth/auth.repository.js";

export const authMiddleware = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        return next(new UnAuthorisedError("unauthorised Access"));
      }

      const decoded = verifyToken(token);

      if (!decoded?.userId) {
        return next(new UnAuthorisedError("Invalid token payload"));
      }

      const user = await authRepository.findUserById(decoded.userId);

      if (!user) {
        return next(new UnAuthorisedError("User no longer exists"));
      }

      if (allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          return next(new ForbiddenError("Access Denied"));
        }
      }

      req.user = {
        id: user.id,
        role: user.role,
      };

      next();
    } catch (error) {
      if (
        error instanceof ForbiddenError ||
        error instanceof UnAuthorisedError
      ) {
        return next(error);
      }

      return next(new UnAuthorisedError("Invalid or expired token"));
    }
  };
};

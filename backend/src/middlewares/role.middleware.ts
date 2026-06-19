import type { Request, Response, NextFunction } from "express";
import { Role } from "../constants/roles.js";
import { ApiError } from "../utils/ApiError.js";
import { MESSAGES } from "../constants/messages.js";

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(MESSAGES.ACCESS_DENIED));
    }

    next();
  };
}

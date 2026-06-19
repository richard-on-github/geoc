import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { MESSAGES } from "../constants/messages.js";
import { HTTP_STATUS } from "../constants/http-status.js";

export function authenticate() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw ApiError.unauthorized(MESSAGES.UNAUTHORIZED);
      }

      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true, actif: true },
      });

      if (!user || !user.actif) {
        throw ApiError.unauthorized(
          user ? MESSAGES.ACCOUNT_DISABLED : MESSAGES.USER_NOT_FOUND,
        );
      }

      req.user = {
        id: user.id,
        role: user.role as any, // Rôle de l'énumération
      };

      next();
    } catch (error) {
      // Si c'est une ApiError, on la passe directement
      if (error instanceof ApiError) {
        return next(error);
      }
      // Gestion des erreurs JWT spécifiques
      if (error instanceof Error) {
        if (error.name === "TokenExpiredError") {
          return next(ApiError.unauthorized(MESSAGES.TOKEN_EXPIRED));
        }
        if (
          error.name === "JsonWebTokenError" ||
          error.name === "NotBeforeError"
        ) {
          return next(ApiError.unauthorized(MESSAGES.INVALID_TOKEN));
        }
      }
      next(ApiError.unauthorized(MESSAGES.UNAUTHORIZED));
    }
  };
}

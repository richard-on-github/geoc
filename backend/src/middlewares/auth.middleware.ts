import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { MESSAGES } from "../constants/messages.js";

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

      // 1. Requête 100% alignée sur votre véritable schéma Prisma
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          actif: true,
          agenceId: true, // INDISPENSABLE pour requireDataScope
          role: {
            select: {
              id: true,
              nom: true, // Ex: "ADMIN", "CHEF_AGENCE", etc.
              niveau: true,
              dataScope: true, // Le vrai nom de la colonne dans votre BD !
              isSystem: true,
            },
          },
        },
      });

      if (!user || !user.actif) {
        throw ApiError.unauthorized(
          user ? MESSAGES.ACCOUNT_DISABLED : MESSAGES.USER_NOT_FOUND,
        );
      }

      // 2. Hydratation propre et légère de req.user
      req.user = {
        id: user.id,
        agenceId: user.agenceId,
        role: user.role, // Contient { id, nom, dataScope, isSystem }
      };

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error);
      }
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

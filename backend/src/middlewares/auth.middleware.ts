import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import { MESSAGES } from "../constants/messages.js";
import { env } from "../config/env.js";

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

      const sessionId = payload.sessionId as string;
      if (!sessionId) {
        throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);
      }

      // Vérification de la session en base de données
      const session = await prisma.refreshToken.findUnique({
        where: { id: sessionId },
      });

      if (!session || session.revoked) {
        throw ApiError.unauthorized(
          "Votre session est invalide ou a été révoquée.",
        );
      }

      const now = new Date();
      const inactiveMinutes =
        (now.getTime() - session.lastActivityAt.getTime()) / 60000;

      if (inactiveMinutes > env.SESSION_TIMEOUT_MINUTES) {
        // Révocation de la session expirée
        await prisma.refreshToken.update({
          where: { id: session.id },
          data: { revoked: true, revokedAt: now },
        });
        throw ApiError.unauthorized(
          "Session expirée suite à une période d'inactivité. Veuillez vous reconnecter.",
        );
      }

      // Optimisation: on ne met à jour l'activité que si plus d'une minute s'est écoulée
      // pour éviter de saturer la DB à chaque appel API
      if (inactiveMinutes > 1) {
        await prisma.refreshToken.update({
          where: { id: session.id },
          data: { lastActivityAt: now },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub as string },
        select: {
          id: true,
          actif: true,
          agenceId: true,
          role: {
            select: {
              id: true,
              nom: true,
              niveau: true,
              dataScope: true,
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

      req.user = {
        id: user.id,
        agenceId: user.agenceId,
        role: user.role,
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

import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/http-status.js";
import { MESSAGES } from "../constants/messages.js";
import { prisma } from "../config/prisma.js";

export function requirePermissions(...requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          MESSAGES.UNAUTHORIZED || "Non authentifié",
        );
      }

      let userPermissions: string[] = [];

      // 1. Tenter d'extraire les permissions depuis le JWT s'il est présent
      if (req.user.permissions && Array.isArray(req.user.permissions)) {
        userPermissions = req.user.permissions;
      } else {
        // 2. Fallback : Recharger depuis la base de données si non présentes dans le JWT
        const userWithPermissions = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
            permissions: {
              include: { permission: true },
            },
          },
        });

        if (
          !userWithPermissions ||
          (userWithPermissions.role && !userWithPermissions.role.actif)
        ) {
          throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            MESSAGES.FORBIDDEN || "Accès interdit",
          );
        }

        const rolePermissions =
          userWithPermissions.role?.permissions.map(
            (rp) => rp.permission.code,
          ) || [];
        const directPermissions = userWithPermissions.permissions.map(
          (up) => up.permission.code,
        );

        userPermissions = Array.from(
          new Set([...rolePermissions, ...directPermissions]),
        );
      }

      // 3. Vérifier la présence de toutes les permissions requises
      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.includes(perm),
      );

      if (!hasAllPermissions) {
        throw new ApiError(
          HTTP_STATUS.FORBIDDEN,
          MESSAGES.FORBIDDEN || "Permissions insuffisantes",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

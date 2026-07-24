import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/http-status.js";

/**
 * Garantit que l'utilisateur est un administrateur GLOBAL du système.
 * Interdit formellement l'accès si l'utilisateur est rattaché à une agence.
 */
export const requireGlobalAdmin = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        status: HTTP_STATUS.UNAUTHORIZED,
        message: "Non authentifié",
        data: null,
      });
      return;
    }

    // Si l'utilisateur appartient à une agence, il n'a AUCUN DROIT de gestion sur les rôles !
    if (user.agenceId !== null && user.agenceId !== undefined) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        status: HTTP_STATUS.FORBIDDEN,
        message:
          "Accès refusé. Les utilisateurs en agence ne peuvent pas gérer les rôles de l'application.",
        data: null,
      });
      return;
    }

    next();
  };
};

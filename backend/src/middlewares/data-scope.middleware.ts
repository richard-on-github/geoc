import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../constants/http-status.js";

export const requireDataScope = () => {
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

    const dataScope = user.role?.dataScope;

    if (dataScope === "AGENCE") {
      if (!user.agenceId) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          status: HTTP_STATUS.FORBIDDEN,
          message:
            "Vous n'êtes associé à aucune agence et devriez contacter un administrateur.",
          data: null,
        });
        return;
      }

      req.dataScopeWhere = { agenceId: user.agenceId };
      return next();
    }

    if (dataScope === "GLOBAL") {
      req.dataScopeWhere = {};
      return next();
    }

    next();
  };
};

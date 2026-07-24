import type { Request, Response, NextFunction } from "express";
import { contextStorage } from "../utils/context.js";

export function initRequestContext() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Pas d'utilisateur (route publique, login, etc.)
    }

    // On prépare les données de cloisonnement
    const context = {
      userId: req.user.id,
      agenceId: req.user.agenceId,
      dataScope: req.user.role.dataScope as "GLOBAL" | "AGENCE",
    };

    // On exécute la suite de la requête dans ce "contexte sécurisé"
    contextStorage.run(context, () => {
      next();
    });
  };
}

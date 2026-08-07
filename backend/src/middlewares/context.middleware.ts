import type { Request, Response, NextFunction } from "express";
import { contextStorage } from "../utils/context.js";
import { prisma } from "../config/prisma.js";

export function initRequestContext() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Pas d'utilisateur (route publique, login, etc.)
    }

    let agenceNom: string | null = null;
    if (req.user.agenceId) {
      const agence = await prisma.agence.findUnique({
        where: { id: req.user.agenceId },
        select: { nom: true },
      });
      agenceNom = agence?.nom || null;
    }

    // On prépare les données de cloisonnement et d'information
    const context = {
      userId: req.user.id,
      agenceId: req.user.agenceId,
      agenceNom,
      dataScope: req.user.role.dataScope as "GLOBAL" | "AGENCE",
    };

    // On exécute la suite de la requête dans ce "contexte sécurisé"
    contextStorage.run(context, () => {
      next();
    });
  };
}

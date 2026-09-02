import type { Request, Response, NextFunction } from "express";
import { venteRecuService } from "./vente-recu.service.js";
import { prisma } from "../../config/prisma.js"; // Importe prisma si ce n'est pas déjà fait

export const venteRecuController = {
  async telecharger(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = (req as any).user?.id || (req as any).user?.userId;

      let agentNom = "Agent";

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { nom: true, prenom: true },
        });

        if (user) {
          const nomMaj = user.nom ? user.nom.toUpperCase() : "";
          const prenomCamel = user.prenom
            ? user.prenom
                .toLowerCase()
                .split(" ")
                .map(
                  (part: string) =>
                    part.charAt(0).toUpperCase() + part.slice(1),
                )
                .join(" ")
            : "";

          agentNom = `${prenomCamel} ${nomMaj}`.trim();
        }
      }

      const pdfDocument = await venteRecuService.generatePDF(
        req.params.id,
        agentNom,
      );

      const timestamp = Date.now();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="recu_${req.params.id}_${timestamp}.pdf"`,
      );

      pdfDocument.pipe(res);
      pdfDocument.end();
    } catch (error) {
      next(error);
    }
  },
};

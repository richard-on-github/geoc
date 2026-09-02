import type { Request, Response, NextFunction } from "express";
import { venteRecuService } from "./vente-recu.service.js";

export const venteRecuController = {
  /**
   * Contrairement aux exports (CSV/Excel/PDF chiffrés en zip), le reçu est un
   * document destiné à être imprimé et remis en main propre : le chiffrer
   * n'aurait pas de sens (il faudrait transmettre un mot de passe à
   * quelqu'un qui va simplement l'imprimer). PDF simple, non protégé.
   */
  async telecharger(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const pdfDocument = await venteRecuService.generatePDF(req.params.id);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="recu-${req.params.id}.pdf"`,
      );
      pdfDocument.pipe(res);
      pdfDocument.end();
    } catch (error) {
      next(error);
    }
  },
};

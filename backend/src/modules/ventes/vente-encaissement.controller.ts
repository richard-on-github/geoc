import type { Request, Response, NextFunction } from "express";
import { venteEncaissementService } from "./vente-encaissement.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { EncaissementInput } from "./vente-encaissement.interface.js";

export const venteEncaissementController = {
  async create(req: Request, res: Response, next: NextFunction) {
    const { venteId, montant, dateEncaissement } = req.body as EncaissementInput;
    const result = await venteEncaissementService.enregistrerEncaissement(
      venteId,
      montant,
      new Date(dateEncaissement),
      req.user!.id,
      req.ip,
    );
    successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Encaissement enregistré avec succès",
      result,
    );
  },

  async getHistorique(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const result = await venteEncaissementService.getHistorique(id);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Historique des encaissements récupéré",
      result,
    );
  },
};

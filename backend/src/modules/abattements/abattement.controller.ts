import type { Request, Response, NextFunction } from "express";
import { abattementService } from "./abattement.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type {
  AbattementQueryParams,
  VersementInput,
  AbattementParametresInput,
} from "./abattement.interface.js";

export const abattementController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as AbattementQueryParams;
    const result = await abattementService.getAll(query);
    successResponse(res, HTTP_STATUS.OK, "Liste des abattements récupérée", result);
  },

  async getParametres(req: Request, res: Response, next: NextFunction) {
    const result = await abattementService.getParametres();
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Paramètres d'abattement récupérés",
      result,
    );
  },

  async updateParametres(req: Request, res: Response, next: NextFunction) {
    const body = req.body as AbattementParametresInput;
    const result = await abattementService.updateParametres(
      body,
      req.user!.id,
      req.ip,
    );
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Paramètres d'abattement mis à jour avec succès",
      result,
    );
  },

  async enregistrerVersement(req: Request, res: Response, next: NextFunction) {
    const { venteId, montantVerse, dateVersement } = req.body as VersementInput;
    const result = await abattementService.enregistrerVersement(
      venteId,
      montantVerse,
      new Date(dateVersement),
      req.user!.id,
      req.ip,
    );
    successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Versement enregistré avec succès",
      result,
    );
  },
};

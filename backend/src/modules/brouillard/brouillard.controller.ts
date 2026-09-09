import type { Request, Response, NextFunction } from "express";
import { brouillardService } from "./brouillard.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type {
  BrouillardQueryParams,
  ClotureBrouillardInput,
  RejeterBrouillardInput,
} from "./brouillard.interface.js";

export const brouillardController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as BrouillardQueryParams;
    const result = await brouillardService.getAll(query);
    successResponse(res, HTTP_STATUS.OK, "Liste des brouillards récupérée", result);
  },

  async cloturer(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const { situation } = req.body as ClotureBrouillardInput;
    const result = await brouillardService.cloturer(
      req.params.id,
      req.user!.id,
      situation,
      req.ip,
    );
    successResponse(res, HTTP_STATUS.OK, "Brouillard clôturé avec succès", result);
  },

  async valider(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const result = await brouillardService.valider(
      req.params.id,
      req.user!.id,
      req.ip,
    );
    successResponse(res, HTTP_STATUS.OK, "Brouillard validé avec succès", result);
  },

  async rejeter(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    const { raison } = req.body as RejeterBrouillardInput;
    const result = await brouillardService.rejeter(
      req.params.id,
      req.user!.id,
      raison,
      req.ip,
    );
    successResponse(res, HTTP_STATUS.OK, "Brouillard rejeté", result);
  },
};

import type { Request, Response, NextFunction } from "express";
import { agenceService } from "./agence.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type {
  AgenceAllQueryParams,
  AgenceQueryParams,
  CreateAgenceInput,
  UpdateAgenceInput,
  UpdateAgenceStatusInput,
} from "./agence.interface.js";

export const agenceController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as AgenceQueryParams;
    const result = await agenceService.getAll(query);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Liste des agences récupérée avec succès",
      result,
    );
  },

  async findAllWithoutPagination(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const query = req.query as unknown as AgenceAllQueryParams;
    const agences = await agenceService.getAllWithoutPagination(query);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Liste des agences récupérée avec succès",
      agences,
    );
  },

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const agence = await agenceService.getById(id);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Détails de l'agence récupérés avec succès",
      agence,
    );
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const input: CreateAgenceInput = req.body;
    const agence = await agenceService.create(input, req.user!.id, req.ip);
    successResponse(
      res,
      HTTP_STATUS.CREATED,
      "Agence créée avec succès",
      agence,
    );
  },

  async update(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const input: UpdateAgenceInput = req.body;
    const agence = await agenceService.update(id, input, req.user!.id, req.ip);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Agence mise à jour avec succès",
      agence,
    );
  },

  async updateStatus(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const input: UpdateAgenceStatusInput = req.body;
    const agence = await agenceService.updateStatus(
      id,
      input,
      req.user!.id,
      req.ip,
    );
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Statut de l'agence mis à jour avec succès",
      agence,
    );
  },

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    await agenceService.delete(id, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, "Agence supprimée avec succès", null);
  },
};

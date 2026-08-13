import type { Request, Response, NextFunction } from "express";
import { emailAutoriseService } from "./email-autorise.service.js";
import { successResponse } from "../../../utils/response.js";
import { HTTP_STATUS } from "../../../constants/http-status.js";
import type { EmailAutoriseInput } from "./email-autorise.interface.js";

export const emailAutoriseController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const result = await emailAutoriseService.list();
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Liste des emails autorisés récupérée",
      result,
    );
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body as EmailAutoriseInput;
    const result = await emailAutoriseService.add(email, req.user!.id, req.ip);
    successResponse(
      res,
      HTTP_STATUS.CREATED,
      `L'adresse ${result.email} a été ajoutée à la liste autorisée.`,
      result,
    );
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params as { id: string };
    const result = await emailAutoriseService.remove(id, req.user!.id, req.ip);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "L'adresse a été retirée de la liste autorisée.",
      result,
    );
  },
};

import type { Request, Response, NextFunction } from "express";
import { brouillardService } from "./brouillard.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { BrouillardQueryParams } from "./brouillard.interface.js";

export const brouillardController = {
  async find(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as BrouillardQueryParams;
    const result = await brouillardService.getBrouillard(query);
    successResponse(res, HTTP_STATUS.OK, "Brouillard récupéré", result);
  },
};

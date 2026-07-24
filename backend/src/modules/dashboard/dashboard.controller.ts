import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "./dashboard.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type { DashboardQueryParams } from "./dashboard.interface.js";

export const dashboardController = {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as DashboardQueryParams;
    // On transmet req.dataScopeWhere pour garantir que le chef d'agence ne voit que ses stats
    const result = await dashboardService.getDashboardSummary(
      query,
      req.dataScopeWhere,
    );

    successResponse(
      res,
      HTTP_STATUS.OK,
      "Données analytiques du tableau de bord récupérées avec succès",
      result,
    );
  },
};

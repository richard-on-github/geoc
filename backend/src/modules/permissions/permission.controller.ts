import type { Request, Response, NextFunction } from "express";
import { permissionService } from "./permission.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type {PermissionAllQueryParams, PermissionQueryParams} from "./permission.interface.js";

export const permissionController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as PermissionQueryParams;
    const result = await permissionService.getAll(query);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Permissions récupérées avec succès",
      result,
    );
  },

  async findAllWithoutPagination(
      req: Request,
      res: Response,
      next: NextFunction,
  ) {
    const query = req.query as unknown as PermissionAllQueryParams;
    const result = await permissionService.getAllWithoutPagination(query);
    successResponse(
        res,
        HTTP_STATUS.OK,
        "Liste des permissions (simplifiée) récupérée avec succès",
        result,
    );
  },

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const permission = await permissionService.getById(id);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Permission récupérée avec succès",
      permission,
    );
  }
};

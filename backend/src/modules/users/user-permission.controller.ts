import type { Request, Response, NextFunction } from "express";
import { userPermissionService } from "./user-permission.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";

export const userPermissionController = {
  async findUserPermissions(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    const { userId } = req.params;
    const permissions = await userPermissionService.getUserPermissions(userId);
    successResponse(res, HTTP_STATUS.OK, "Permissions directes de l'utilisateur récupérées", permissions);
  },

  async addUserPermissions(req: Request<{ userId: string }>, res: Response, next: NextFunction) {
    const { userId } = req.params;
    const { permissionIds } = req.body;
    await userPermissionService.addUserPermissions(userId, permissionIds, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, "Permissions directes ajoutées avec succès", null);
  },

  async deleteUserPermission(req: Request<{ userId: string; permissionId: string }>, res: Response, next: NextFunction) {
    const { userId, permissionId } = req.params;
    await userPermissionService.deleteUserPermission(userId, permissionId, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, "Permission directe supprimée avec succès", null);
  },
};
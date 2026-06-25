import type { Request, Response, NextFunction } from "express";
import { roleService } from "./role.service.js";
import { successResponse } from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import type {
  RoleQueryParams,
  CreateRoleInput,
  UpdateRoleInput,
  RolePermissionInput,
} from "./role.interface.js";

export const roleController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    const query = req.query as unknown as RoleQueryParams;
    const result = await roleService.getAll(query);
    successResponse(res, HTTP_STATUS.OK, "Rôles récupérés avec succès", result);
  },

  async findById(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const role = await roleService.getById(id);
    successResponse(res, HTTP_STATUS.OK, "Rôle récupéré avec succès", role);
  },

  async create(req: Request, res: Response, next: NextFunction) {
    const input: CreateRoleInput = req.body;
    const role = await roleService.create(input, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.CREATED, "Rôle créé avec succès", role);
  },

  async update(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const input: UpdateRoleInput = req.body;
    const role = await roleService.update(id, input, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, "Rôle mis à jour avec succès", role);
  },

  async delete(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    await roleService.delete(id, req.user!.id, req.ip);
    successResponse(res, HTTP_STATUS.OK, "Rôle supprimé avec succès", null);
  },

  async findRolePermissions(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const permissions = await roleService.getRolePermissions(id);
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Permissions du rôle récupérées avec succès",
      permissions,
    );
  },

  async addRolePermissions(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { id } = req.params;
    const input: RolePermissionInput = req.body;
    await roleService.addRolePermissions(
      id,
      input.permissionIds,
      req.user!.id,
      req.ip,
    );
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Permissions associées au rôle avec succès",
      null,
    );
  },

  async deleteRolePermission(
    req: Request<{ roleId: string; permissionId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    const { roleId, permissionId } = req.params;
    await roleService.deleteRolePermission(
      roleId,
      permissionId,
      req.user!.id,
      req.ip,
    );
    successResponse(
      res,
      HTTP_STATUS.OK,
      "Permission dissociée du rôle avec succès",
      null,
    );
  },
};

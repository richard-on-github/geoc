import { permissionRepository } from "./permission.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";
import type { PermissionQueryParams } from "./permission.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const permissionService = {
  async getAll(params: PermissionQueryParams) {
    const { permissions, total, page, limit } =
      await permissionRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { permissions, pagination };
  },

  async getById(id: string) {
    const permission = await permissionRepository.findById(id);
    if (!permission) {
      throw ApiError.notFound(
        MESSAGES.RESOURCE_NOT_FOUND || "Permission introuvable",
      );
    }
    return permission;
  },
};

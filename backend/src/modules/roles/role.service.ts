import { roleRepository } from "./role.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import { MESSAGES } from "../../constants/messages.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";
import type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleQueryParams,
} from "./role.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const roleService = {
  async getAll(params: RoleQueryParams) {
    const { roles, total, page, limit } = await roleRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { roles, pagination };
  },

  async getById(id: string) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw ApiError.notFound(
        MESSAGES.RESOURCE_NOT_FOUND || "Rôle introuvable",
      );
    }
    return role;
  },

  async create(input: CreateRoleInput, actorId: string, ip?: string) {
    const existingRole = await roleRepository.findByCode(input.code);
    if (existingRole) {
      throw ApiError.conflict(
        MESSAGES.RESOURCE_ALREADY_EXISTS || "Ce code de rôle existe déjà",
      );
    }

    const role = await roleRepository.create(input);

    await logAudit({
      action: AuditAction.CREATION,
      entity: "Role",
      entityId: role.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Création du rôle ${role.code}`,
      after: role as any,
    });

    return role;
  },

  async update(
    id: string,
    input: UpdateRoleInput,
    actorId: string,
    ip?: string,
  ) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw ApiError.notFound(
        MESSAGES.RESOURCE_NOT_FOUND || "Rôle introuvable",
      );
    }

    if (role.isSystem) {
      if (input.actif === false) {
        throw ApiError.badRequest("Impossible de désactiver un rôle système");
      }
    }

    if (input.code && input.code !== role.code) {
      const existing = await roleRepository.findByCode(input.code);
      if (existing) {
        throw ApiError.conflict(
          MESSAGES.RESOURCE_ALREADY_EXISTS || "Ce code de rôle existe déjà",
        );
      }
    }

    const before = { ...role };
    const updatedRole = await roleRepository.update(id, input);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "Role",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Modification du rôle ${role.code}`,
      before: before as any,
      after: updatedRole as any,
    });

    return updatedRole;
  },

  async delete(id: string, actorId: string, ip?: string) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw ApiError.notFound(
        MESSAGES.RESOURCE_NOT_FOUND || "Rôle introuvable",
      );
    }

    if (role.isSystem) {
      throw ApiError.badRequest("Impossible de supprimer un rôle système");
    }

    await roleRepository.delete(id);

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "Role",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Suppression du rôle ${role.code}`,
      before: role as any,
    });
  },
};

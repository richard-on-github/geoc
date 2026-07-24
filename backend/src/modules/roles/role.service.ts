import { roleRepository } from "./role.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";
import type {
  CreateRoleInput,
  UpdateRoleInput,
  RoleQueryParams,
  RoleAllQueryParams,
} from "./role.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const roleService = {
  async getAll(params: RoleQueryParams) {
    const { roles, total, page, limit } = await roleRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { roles, pagination };
  },

  async getAllWithoutPagination(params: RoleAllQueryParams) {
    return roleRepository.findAllWithoutPagination(params);
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

  async create(
    input: CreateRoleInput,
    actor: { id: string; agenceId?: string | null; niveau: number },
    ip?: string,
  ) {
    // 1. Empêcher l'escalade de privilège
    if (input.niveau >= actor.niveau) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas créer un rôle de niveau égal ou supérieur au vôtre.",
      );
    }

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
      userId: actor.id,
      ip: ip ?? "",
      message: `Création du rôle ${role.code}`,
      after: role as any,
      agenceId: actor.agenceId || undefined,
    });

    return role;
  },

  async update(
    id: string,
    input: UpdateRoleInput,
    actor: { id: string; agenceId?: string | null; niveau: number },
    ip?: string,
  ) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw ApiError.notFound(
        MESSAGES.RESOURCE_NOT_FOUND || "Rôle introuvable",
      );
    }

    if (role.isSystem) {
      if (
        (input.code && input.code !== role.code) ||
        (input.dataScope && input.dataScope !== role.dataScope) ||
        (input.niveau !== undefined && input.niveau !== role.niveau)
      ) {
        throw ApiError.forbidden(
          "Impossible de modifier le code, le périmètre ou le niveau d'un rôle système natif.",
        );
      }
    }

    if (role.code === "SYSTEM") {
      throw ApiError.forbidden(
        "Le rôle système natif ne peut pas être modifié.",
      );
    }

    if (role.niveau >= actor.niveau) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas modifier un rôle de niveau égal ou supérieur au vôtre.",
      );
    }

    if (input.niveau !== undefined && input.niveau >= actor.niveau) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas élever un rôle à un niveau égal ou supérieur au vôtre.",
      );
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
      userId: actor.id,
      ip: ip ?? "",
      message: `Modification du rôle ${role.code}`,
      before: before as any,
      after: updatedRole as any,
      agenceId: actor.agenceId || undefined,
    });

    return updatedRole;
  },

  async delete(
    id: string,
    actor: { id: string; agenceId?: string | null; niveau: number },
    ip?: string,
  ) {
    const role = await roleRepository.findById(id);
    if (!role) {
      throw ApiError.notFound(
        MESSAGES.RESOURCE_NOT_FOUND || "Rôle introuvable",
      );
    }

    // 1. INTERDICTION DE SUPPRIMER UN RÔLE SYSTÈME
    if (role.isSystem) {
      throw ApiError.forbidden("Impossible de supprimer un rôle système.");
    }

    // 2. Empêcher de supprimer un rôle de niveau >= au nôtre
    if (role.niveau >= actor.niveau) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas supprimer un rôle de niveau égal ou supérieur au vôtre.",
      );
    }

    await roleRepository.delete(id);

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "Role",
      entityId: id,
      userId: actor.id,
      ip: ip ?? "",
      message: `Suppression du rôle ${role.code}`,
      before: role as any,
      agenceId: actor.agenceId || undefined,
    });
  },
};

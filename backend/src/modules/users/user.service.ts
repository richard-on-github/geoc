import { userRepository } from "./user.repository.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import { hashPassword } from "../../utils/password.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";
import type {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
  UserQueryParams,
} from "./user.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";
import { contextStorage } from "../../utils/context.js"; // Import du stockage contextuel

export const userService = {
  async getAll(params: UserQueryParams) {
    const { users, total, page, limit } = await userRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { users, pagination };
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }
    return user;
  },

  async create(input: CreateUserInput, actorId: string, ip?: string) {
    const roleExists = await prisma.role.findUnique({
      where: { id: input.roleId },
    });
    if (!roleExists) {
      throw ApiError.badRequest("Le rôle spécifié est introuvable");
    }

    if (roleExists && roleExists?.code === "SYSTEM") {
      throw ApiError.forbidden(
        "Le rôle SYSTEM ne peut pas être attribué à un utilisateur.",
      );
    }

    // Interception des règles métiers via le contexte asynchrone global
    const ctx = contextStorage.getStore();
    let agenceId = input.agenceId;

    if (ctx?.dataScope === "AGENCE") {
      if (!ctx.agenceId) {
        throw ApiError.forbidden(
          "Vous n'êtes associé à aucune agence et ne pouvez pas créer d'utilisateur.",
        );
      }
      // Forçage de sécurité : L'agence de la cible devient obligatoirement celle de l'acteur
      agenceId = ctx.agenceId;
    }

    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const password = input.password || "ChangeMe123!";
    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      ...input,
      agenceId,
      passwordHash,
      permissionIds: input.permissionIds,
    });

    await logAudit({
      action: AuditAction.CREATION,
      entity: "User",
      entityId: user.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Création de l'utilisateur ${user.email}`,
      after: user as any,
      agenceId: agenceId || undefined,
    });

    return user;
  },

  async update(
    id: string,
    input: UpdateUserInput,
    actorId: string,
    ip?: string,
  ) {
    // Le repository effectue un findById automatiquement cloisonné par l'extension Prisma
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    if (input.email && input.email !== existingUser.email) {
      const existing = await userRepository.findByEmail(input.email, id);
      if (existing) {
        throw ApiError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }

    if (input.roleId) {
      const roleExists = await prisma.role.findUnique({
        where: { id: input.roleId },
      });
      if (!roleExists) {
        throw ApiError.badRequest("Le rôle spécifié est introuvable");
      }

      if (roleExists && roleExists?.code === "SYSTEM") {
        throw ApiError.forbidden(
          "Le rôle SYSTEM ne peut pas être modifié.",
        );
      }
    }

    const ctx = contextStorage.getStore();
    if (
      ctx?.dataScope === "AGENCE" &&
      input.agenceId !== undefined &&
      input.agenceId !== ctx.agenceId
    ) {
      throw ApiError.forbidden(
        "Vous ne pouvez pas modifier l'affectation d'agence d'un utilisateur.",
      );
    }

    const before = { ...existingUser };
    const updatedUser = await userRepository.update(id, input);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Modification de l'utilisateur ${existingUser.email}`,
      before: before as any,
      after: updatedUser as any,
      agenceId: existingUser.agenceId || undefined,
    });

    return updatedUser;
  },

  async updateStatus(
    id: string,
    input: UpdateUserStatusInput,
    actorId: string,
    ip?: string,
  ) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const before = { ...existingUser };
    const updatedUser = await userRepository.updateStatus(id, input.actif);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `${input.actif ? "Activation" : "Désactivation"} de l'utilisateur ${existingUser.email}`,
      before: before as any,
      after: updatedUser as any,
      agenceId: existingUser.agenceId || undefined,
    });

    return updatedUser;
  },

  async delete(id: string, actorId: string, ip?: string) {
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    await userRepository.delete(id);

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "User",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Suppression de l'utilisateur ${existingUser.email}`,
      before: existingUser as any,
      agenceId: existingUser.agenceId || undefined,
    });
  },
};

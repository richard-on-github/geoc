import { userRepository } from "./user.repository.js";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
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
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict(MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const roleExists = await prisma.role.findUnique({
      where: { id: input.roleId },
    });
    if (!roleExists) {
      throw ApiError.badRequest("Le rôle spécifié est introuvable");
    }

    const password = input.password || "ChangeMe123!";
    const passwordHash = await hashPassword(password);

    const user = await userRepository.create({
      ...input,
      passwordHash,
      permissionIds: input.permissionIds
    });

    await logAudit({
      action: AuditAction.CREATION,
      entity: "User",
      entityId: user.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Création de l'utilisateur ${user.email}`,
      after: user as any,
    });

    return user;
  },

  async update(
    id: string,
    input: UpdateUserInput,
    actorId: string,
    ip?: string,
  ) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    if (input.email && input.email !== user.email) {
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
    }

    const before = { ...user };
    const updatedUser = await userRepository.update(id, input);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Modification de l'utilisateur ${user.email}`,
      before: before as any,
      after: updatedUser as any,
    });

    return updatedUser;
  },

  async updateStatus(
    id: string,
    input: UpdateUserStatusInput,
    actorId: string,
    ip?: string,
  ) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const before = { ...user };
    const updatedUser = await userRepository.updateStatus(id, input.actif);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `${input.actif ? "Activation" : "Désactivation"} de l'utilisateur ${user.email}`,
      before: before as any,
      after: updatedUser as any,
    });

    return updatedUser;
  },

  async delete(id: string, actorId: string, ip?: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    await userRepository.delete(id);

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "User",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Suppression de l'utilisateur ${user.email}`,
      before: user as any,
    });
  },
};

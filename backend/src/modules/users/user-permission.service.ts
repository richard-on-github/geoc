import { userPermissionRepository } from "./user-permission.repository.js";
import { userRepository } from "../user/user.repository.js"; 
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";

export const userPermissionService = {
  async getUserPermissions(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND || "Utilisateur introuvable");
    }
    const relations = await userPermissionRepository.findDirectPermissions(userId);
    return relations.map((r) => r.permission);
  },

  async addUserPermissions(userId: string, permissionIds: string[], actorId: string, ip?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND || "Utilisateur introuvable");
    }

    await userPermissionRepository.addDirectPermissions(userId, permissionIds);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: userId,
      userId: actorId,
      ip: ip ?? "",
      message: `Permissions directes ajoutées à l'utilisateur ${user.email}`,
      after: { permissionIds } as any,
    });
  },

  async deleteUserPermission(userId: string, permissionId: string, actorId: string, ip?: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND || "Utilisateur introuvable");
    }

    await userPermissionRepository.deleteDirectPermission(userId, permissionId);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: userId,
      userId: actorId,
      ip: ip ?? "",
      message: `Permission directe retirée de l'utilisateur ${user.email}`,
      before: { permissionId } as any,
    });
  },
};
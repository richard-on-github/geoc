import crypto from "crypto";
import { authRepository } from "./auth.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import { HTTP_STATUS } from "../../constants/http-status.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import type {
  LoginInput,
  AuthTokens,
  RefreshTokenInput,
  ChangePasswordInput,
  ResetPasswordInput,
} from "./auth.interface.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";

export const authService = {
  async login(input: LoginInput, ip?: string): Promise<AuthTokens> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.actif) {
      throw ApiError.forbidden(MESSAGES.ACCOUNT_DISABLED);
    }

    const isValidPassword = await comparePassword(
      input.password,
      user.passwordHash,
    );
    if (!isValidPassword) {
      throw ApiError.unauthorized(MESSAGES.INVALID_CREDENTIALS);
    }

    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshTokenJti = crypto.randomUUID();
    const refreshToken = generateRefreshToken({
      sub: user.id,
      jti: refreshTokenJti,
    });

    const refreshTokenHash = await authRepository.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

    await authRepository.createRefreshToken(
      user.id,
      refreshTokenHash,
      expiresAt,
    );

    await logAudit({
      action: AuditAction.CONNEXION,
      entity: "User",
      entityId: user.id,
      userId: user.id,
      ip: ip ?? "",
      message: "Connexion réussie",
    });

    return { accessToken, refreshToken };
  },

  async refreshToken(
    input: RefreshTokenInput,
    ip?: string,
  ): Promise<AuthTokens> {
    const payload = verifyRefreshToken(input.refreshToken);
    const tokenHash = await authRepository.hashToken(input.refreshToken);

    const storedToken = await authRepository.findRefreshTokenByHash(tokenHash);
    if (!storedToken) {
      // Token hash introuvable, pourrait être déjà révoqué
      throw ApiError.unauthorized(MESSAGES.REFRESH_TOKEN_REVOKED);
    }

    if (storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized(MESSAGES.REFRESH_TOKEN_REVOKED);
    }

    // Vérifier que le payload correspond
    if (storedToken.userId !== payload.sub) {
      throw ApiError.unauthorized(MESSAGES.INVALID_TOKEN);
    }

    // Révoquer l'ancien token
    await authRepository.revokeRefreshToken(storedToken.id);

    // Générer un nouveau token
    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.actif) {
      throw ApiError.unauthorized(MESSAGES.USER_NOT_FOUND);
    }

    const newRefreshJti = crypto.randomUUID();
    const newRefreshToken = generateRefreshToken({
      sub: user.id,
      jti: newRefreshJti,
    });
    const newTokenHash = await authRepository.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await authRepository.createRefreshToken(user.id, newTokenHash, expiresAt);

    const accessToken = generateAccessToken({ sub: user.id, role: user.role });

    return { accessToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string, refreshToken?: string, ip?: string) {
    if (refreshToken) {
      const tokenHash = await authRepository.hashToken(refreshToken);
      const storedToken =
        await authRepository.findRefreshTokenByHash(tokenHash);
      if (storedToken && !storedToken.revoked) {
        await authRepository.revokeRefreshToken(storedToken.id);
      }
    } else {
      // Révoquer tous les refresh tokens de l'utilisateur
      await authRepository.revokeAllUserRefreshTokens(userId);
    }

    await logAudit({
      action: AuditAction.DECONNEXION,
      entity: "User",
      entityId: userId,
      userId,
      ip: ip ?? "",
      message: "Déconnexion",
    });
  },

  async changePassword(
    userId: string,
    input: ChangePasswordInput,
    ip?: string,
  ) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const isValid = await comparePassword(
      input.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw ApiError.badRequest("Mot de passe actuel incorrect");
    }

    const newHash = await hashPassword(input.newPassword);
    await authRepository.updateUserPassword(userId, newHash);

    // Révoquer tous les tokens pour forcer une nouvelle connexion
    await authRepository.revokeAllUserRefreshTokens(userId);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "User",
      entityId: userId,
      userId,
      ip:ip??"",
      message: "Changement de mot de passe",
    });
  },

  async resetPassword(adminId: string, input: ResetPasswordInput, ip?: string) {
    const targetUser = await authRepository.findUserById(input.userId);
    if (!targetUser) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const newHash = await hashPassword(input.newPassword);
    await authRepository.updateUserPassword(input.userId, newHash);

    await authRepository.revokeAllUserRefreshTokens(input.userId);

    await logAudit({
      action: AuditAction.REINITIALISATION_MOT_DE_PASSE,
      entity: "User",
      entityId: input.userId,
      userId: adminId,
      ip:ip??"",
      message: `Mot de passe réinitialisé par l'administrateur ${adminId}`,
    });
  },

  async getMe(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    // Ne pas renvoyer le hash du mot de passe
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

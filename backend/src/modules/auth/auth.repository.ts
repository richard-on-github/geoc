import { prisma } from "../../config/prisma.js";
import type { RefreshTokenPayload } from "../../utils/jwt.js";
import { hashPassword } from "../../utils/password.js";
import bcrypt from "bcryptjs";

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  },

  async findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  },

  async revokeRefreshToken(id: string, replacedBy?: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: {
        revoked: true,
        revokedAt: new Date(),
        ...(replacedBy ? { replacedBy } : {}),
      },
    });
  },

  async revokeAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: {
        revoked: true,
        revokedAt: new Date(),
      },
    });
  },

  async updateUserPassword(userId: string, newPasswordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false,
      },
    });
  },

  async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  },
};

import { prisma } from "../../config/prisma.js";
import crypto from "crypto";

const userWithPermissionsInclude = {
  role: {
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  },
  permissions: {
    include: { permission: true },
  },
  agence: true,
};

export const authRepository = {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: userWithPermissionsInclude,
    });
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: userWithPermissionsInclude,
    });
  },

  async createRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { tokenHash, userId, expiresAt },
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
    return crypto.createHash("sha256").update(token).digest("hex");
  },
};

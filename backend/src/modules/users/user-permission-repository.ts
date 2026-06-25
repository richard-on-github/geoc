import { prisma } from "../../config/prisma.js";

export const userPermissionRepository = {
  async findDirectPermissions(userId: string) {
    return prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
  },

  async addDirectPermissions(userId: string, permissionIds: string[]) {
    const data = permissionIds.map((permissionId) => ({
      userId,
      permissionId,
    }));
    return prisma.userPermission.createMany({
      data,
      skipDuplicates: true,
    });
  },

  async deleteDirectPermission(userId: string, permissionId: string) {
    return prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId,
        },
      },
    });
  },
};

import { prisma } from "../config/prisma.js";

type PermissionLink = {
  permission: {
    code: string;
  };
};
export async function resolveUserPermissions(
  userId: string,
): Promise<string[]> {
  const userWithPermissions = await prisma.user.findUnique({
    where: { id: userId },
    include: {
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
    },
  });

  if (
    !userWithPermissions ||
    (userWithPermissions.role && !userWithPermissions.role.actif)
  ) {
    return [];
  }

  const rolePermissions =
    userWithPermissions.role?.permissions.map(
      (rp: PermissionLink) => rp.permission.code,
    ) ?? [];
  const directPermissions = userWithPermissions.permissions.map(
    (up: PermissionLink) => up.permission.code,
  );

  return Array.from(new Set([...rolePermissions, ...directPermissions]));
}

export async function userHasPermission(
  userId: string,
  code: string,
): Promise<boolean> {
  const permissions = await resolveUserPermissions(userId);
  return permissions.includes(code);
}

import { z } from "zod";

export const userPermissionsParamsSchema = z.object({
  userId: z.string().min(1, "ID utilisateur requis"),
});

export const deleteUserPermissionParamsSchema = z.object({
  userId: z.string().min(1, "ID utilisateur requis"),
  permissionId: z.string().min(1, "ID permission requis"),
});

export const addUserPermissionsBodySchema = z.object({
  permissionIds: z
    .array(z.string().min(1))
    .min(1, "Au moins une permission est requise"),
});
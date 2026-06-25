import { z } from "zod";

export const createRoleSchema = z.object({
  nom: z.string().min(1, "Le nom du rôle est requis"),
  code: z.string().min(1, "Le code du rôle est requis").toUpperCase(),
  description: z.string().optional(),
});

export const updateRoleSchema = z.object({
  nom: z.string().min(1).optional(),
  code: z.string().min(1).toUpperCase().optional(),
  description: z.string().optional(),
  actif: z.boolean().optional(),
});

export const roleQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  search: z.string().optional(),
  actif: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

export const roleIdParamsSchema = z.object({
  id: z.string().min(1, "ID rôle requis"),
});

export const addRolePermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().min(1))
    .min(1, "Au moins une permission requise"),
});

export const deleteRolePermissionParamsSchema = z.object({
  roleId: z.string().min(1, "ID rôle requis"),
  permissionId: z.string().min(1, "ID permission requis"),
});

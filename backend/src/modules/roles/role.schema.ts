import { z } from "zod";

export const createRoleSchema = z.object({
  nom: z.string().min(1, "Le nom du rôle est requis"),
  code: z
    .string()
    .min(1, "Le code du rôle est requis")
    .regex(
      /^[a-zA-Z_]+$/,
      "Le code ne doit contenir que des lettres et des underscores",
    )
    .toUpperCase(),
  description: z.string().optional(),
  dataScope: z.enum(["GLOBAL", "AGENCE"]).refine((val) => val !== undefined, {
    message: "Le scope du rôle (GLOBAL ou AGENCE) est requis",
  }),
  niveau: z.number().int().min(0, "Le niveau doit être un entier positif"),
  permissionIds: z.array(z.string().min(1)).optional().default([]),
});

export const updateRoleSchema = z.object({
  nom: z.string().min(1).optional(),
  code: z
    .string()
    .min(1, "Le code du rôle est requis")
    .regex(
      /^[a-zA-Z_]+$/,
      "Le code ne doit contenir que des lettres et des underscores",
    )
    .toUpperCase()
    .optional(), // CORRIGÉ: Était obligatoire lors de l'update
  description: z.string().optional(),
  dataScope: z.enum(["GLOBAL", "AGENCE"]).optional(),
  niveau: z.number().int().min(0).optional(),
  actif: z.boolean().optional(),
  permissionIds: z.array(z.string().min(1)).optional(),
});

export const roleQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  search: z.string().optional(),
  dataScope: z.enum(["GLOBAL", "AGENCE"]).optional(),
  actif: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
});

export const roleAllQuerySchema = z.object({
  search: z.string().optional(),
  dataScope: z.enum(["GLOBAL", "AGENCE"]).optional(),
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

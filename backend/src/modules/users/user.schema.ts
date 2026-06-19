import { z } from "zod";
import { Role } from "../../constants/roles.js";

export const createUserSchema = z.object({
  prenom: z.string().min(1, "Prénom requis"),
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  telephone: z.string().optional(),
  role: z.nativeEnum(Role),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .optional(),
});

export const updateUserSchema = z.object({
  prenom: z.string().min(1).optional(),
  nom: z.string().min(1).optional(),
  email: z.string().email("Email invalide").optional(),
  telephone: z.string().nullable().optional(),
  role: z.nativeEnum(Role).optional(),
  mustChangePassword: z.boolean().optional(),
});

export const updateUserStatusSchema = z.object({
  actif: z.boolean(),
});

export const userQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  actif: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const userIdParamsSchema = z.object({
  id: z.string().min(1, "ID utilisateur requis"),
});

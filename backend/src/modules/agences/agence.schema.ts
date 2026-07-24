import { z } from "zod";

export const agenceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  actif: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  sortBy: z
    .enum(["nom", "code", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createAgenceSchema = z.object({
  nom: z
    .string()
    .trim()
    .min(2, "Le nom de l'agence doit contenir au moins 2 caractères"),
  code: z
    .string()
    .trim()
    .min(2, "Le code agence doit contenir au moins 2 caractères")
    .toUpperCase(),
  adresse: z.string().trim().optional(),
  telephone: z.string().trim().optional(),
  email: z.string().trim().email("Adresse email invalide").optional(),
});

export const updateAgenceSchema = z.object({
  nom: z.string().trim().min(2).optional(),
  code: z.string().trim().min(2).toUpperCase().optional(),
  adresse: z.string().trim().optional(),
  telephone: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
});

export const updateAgenceStatusSchema = z.object({
  actif: z.boolean({
    error: "Le statut doit être un booléen",
  }),
});

export const agenceAllQuerySchema = z.object({
  search: z.string().trim().optional(),
  actif: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export const agenceIdParamsSchema = z.object({
  id: z.string().min(1, "ID d'agence invalide"),
});

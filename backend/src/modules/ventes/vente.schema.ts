import { z } from "zod";

export const venteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  search: z.string().trim().optional(),
  agenceId: z.string().cuid().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  sortBy: z.enum(["dateDebut", "totalVente", "createdAt"]).default("dateDebut"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Pour la validation d'une vente unitaire (si besoin de modification manuelle)
export const venteIdParamsSchema = z.object({
  id: z.string().cuid("ID de vente invalide"),
});
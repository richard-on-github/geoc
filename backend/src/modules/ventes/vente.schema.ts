import { z } from "zod";

export const venteQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  search: z.string().trim().optional(),
  agenceId: z.string().cuid().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  clotureId: z.string().cuid().optional(),
  nonClotureesOnly: z.coerce.boolean().optional().default(false),
  // Filtres indépendants de la période (dateDebut/dateFin) : permettent de retrouver
  // les ventes d'une journée, d'un mois ou d'une année donnée quelle que soit l'année
  // (ex: jour=45 retrouve toutes les ventes du 45e jour de l'année, tous exercices confondus).
  jour: z.coerce.number().int().min(1).max(366).optional(),
  mois: z.coerce.number().int().min(1).max(12).optional(),
  annee: z.coerce.number().int().min(2000).max(2100).optional(),
  sortBy: z
    .enum(["agenceNom", "dateDebut", "totalVente", "createdAt"])
    .default("dateDebut"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const venteIdParamsSchema = z.object({
  id: z.string().cuid("ID de vente invalide"),
});

/** Format commun "YYYY-MM" utilisé pour toute période mensuelle (import, clôture, annulation). */
const periodeRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
const periodeMessage = "La période doit être au format YYYY-MM (ex: 2026-07)";

export const cloturerVenteSchema = z.object({
  periode: z
    .string()
    .min(1, { message: "La période est requise." })
    .regex(periodeRegex, periodeMessage),
});

/**
 * Corps de la requête d'import. Le fichier est chargé pour une période (mois) précise ;
 * toute ligne du fichier n'appartenant pas à ce mois entraîne le rejet complet de l'import.
 */
export const importVenteBodySchema = z.object({
  periode: z
    .string()
    .min(1, { message: "La période est requise." })
    .regex(periodeRegex, periodeMessage),
});

export const periodeParamsSchema = z.object({
  periode: z.string().regex(periodeRegex, periodeMessage),
});

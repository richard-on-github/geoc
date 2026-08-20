import { z } from "zod";

export const abattementQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  search: z.string().trim().optional(),
  agenceId: z.string().cuid().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  jour: z.coerce.number().int().min(1).max(366).optional(),
  mois: z.coerce.number().int().min(1).max(12).optional(),
  annee: z.coerce.number().int().min(2000).max(2100).optional(),
  statut: z
    .enum(["AUCUN", "RETARD", "MOINS_VERSE", "MOINS_VERSE_AVEC_RETARD", "NON_VERSE"])
    .optional(),
  sortBy: z.enum(["dateDebut", "totalVente", "jourAnnee"]).default("dateDebut"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const venteIdParamsSchema = z.object({
  venteId: z.string().cuid("ID de vente invalide"),
});

export const versementInputSchema = z.object({
  venteId: z.string().cuid("ID de vente invalide"),
  montantVerse: z.coerce
    .number()
    .min(0, { message: "Le montant versé ne peut pas être négatif." }),
  dateVersement: z.string().datetime({
    message: "La date de versement doit être une date ISO 8601 valide.",
  }),
});

/** Toutes les valeurs sont optionnelles à la mise à jour, mais au moins une doit être fournie. */
export const abattementParametresUpdateSchema = z
  .object({
    heureLimiteUTC: z.coerce.number().int().min(0).max(23).optional(),
    tauxRetard: z.coerce.number().min(0).max(100).optional(),
    tauxMoinsVerse: z.coerce.number().min(0).max(100).optional(),
    tauxMoinsVerseAvecRetard: z.coerce.number().min(0).max(100).optional(),
    tauxNonVerse: z.coerce.number().min(0).max(100).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Au moins un paramètre doit être fourni.",
  });

import { z } from "zod";

export const brouillardQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000).default(50),
  agenceId: z.string().cuid().optional(),
  numeroTS10: z.string().trim().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  statutAnomalie: z
    .enum([
      "OK",
      "MOINS_VERSE",
      "MOINS_VERSE_RETARD",
      "RETARD",
      "NON_VERSE",
      "TROP_VERSE",
      "ANOMALIE",
    ])
    .optional(),
  statut: z.enum(["OUVERT", "CLOTURE", "VALIDE", "REJETE"]).optional(),
  sortBy: z.enum(["journee", "ecart", "penalite"]).default("journee"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const brouillardIdParamsSchema = z.object({
  id: z.string().cuid("ID de brouillard invalide"),
});

export const clotureBrouillardSchema = z.object({
  situation: z.string().trim().max(500).optional(),
});

export const rejeterBrouillardSchema = z.object({
  raison: z
    .string()
    .trim()
    .min(1, { message: "Le motif de rejet est requis." }),
});

import { z } from "zod";

export const brouillardQuerySchema = z.object({
  agenceId: z.string().cuid("Agence invalide.").optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

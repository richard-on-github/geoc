import { z } from "zod";

export const encaissementInputSchema = z.object({
  venteId: z.string().cuid("ID de vente invalide"),
  montant: z.coerce
    .number()
    .positive({ message: "Le montant encaissé doit être supérieur à zéro." }),
  dateEncaissement: z.string().datetime({
    message: "La date d'encaissement doit être une date ISO 8601 valide.",
  }),
});

export const venteIdParamsSchema = z.object({
  id: z.string().cuid("ID de vente invalide"),
});

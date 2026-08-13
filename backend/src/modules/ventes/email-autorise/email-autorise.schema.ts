import { z } from "zod";

export const ajouterEmailAutoriseSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
});

export const emailAutoriseIdParamsSchema = z.object({
  id: z.string().cuid("ID invalide"),
});

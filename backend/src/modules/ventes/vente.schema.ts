import {z} from "zod";

export const venteQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(1000).default(50),
    search: z.string().trim().optional(),
    agenceId: z.string().cuid().optional(),
    dateDebut: z.string().datetime().optional(),
    dateFin: z.string().datetime().optional(),
    clotureId: z.string().cuid().optional(),
    nonClotureesOnly: z.coerce.boolean().optional().default(false),
    sortBy: z.enum(["agenceNom", "dateDebut", "totalVente", "createdAt"]).default("dateDebut"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const venteIdParamsSchema = z.object({
    id: z.string().cuid("ID de vente invalide"),
});

export const cloturerVenteSchema = z.object({
    periode: z
        .string().min(1, {message: "La période est requise."})
        .regex(
            /^\d{4}-(0[1-9]|1[0-2])$/,
            "La période doit être au format YYYY-MM (ex: 2026-07)",
        ),
});
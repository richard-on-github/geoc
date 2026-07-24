import { z } from "zod";

export const dashboardQuerySchema = z.object({
  agenceId: z.string().cuid().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

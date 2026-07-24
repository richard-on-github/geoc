import { z } from "zod";

export const permissionQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  search: z.string().optional(),
});

export const permissionAllQuerySchema = z.object({
  search: z.string().optional(),
});

export const permissionIdParamsSchema = z.object({
  id: z.string().min(1, "ID permission requis"),
});

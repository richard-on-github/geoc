import { z } from "zod";
import { AuditAction } from "@prisma/client";

export const auditQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
  action: z.nativeEnum(AuditAction).optional(),
  userId: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const auditIdParamsSchema = z.object({
  id: z.string().min(1),
});

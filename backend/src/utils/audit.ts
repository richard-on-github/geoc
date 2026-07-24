import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

interface AuditLogInput {
  action: AuditAction;
  entity: string;
  entityId?: string;
  userId?: string;
  ip?: string;
  before?: Prisma.JsonValue;
  after?: Prisma.JsonValue;
  message?: string;
  agenceId?: string | null;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        userId: input.userId ?? null,
        ip: input.ip ?? null,
        before: input.before ?? undefined,
        after: input.after ?? undefined,
        message: input.message ?? null,
        agenceId: input.agenceId ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

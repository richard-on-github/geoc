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
      },
    });
  } catch (error) {
    // Échec silencieux pour ne pas casser le flux principal
    console.error("Failed to write audit log:", error);
  }
}

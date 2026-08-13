import { emailAutoriseRepository } from "./email-autorise.repository.js";
import { ApiError } from "../../../utils/ApiError.js";
import { logAudit } from "../../../utils/audit.js";
import { AuditAction } from "@prisma/client";

export const emailAutoriseService = {
  async list() {
    return emailAutoriseRepository.findAll();
  },

  async add(email: string, actorId: string, ip?: string) {
    const normalized = email.trim().toLowerCase();

    const existing = await emailAutoriseRepository.findByEmail(normalized);
    if (existing) {
      throw ApiError.conflict(`L'adresse ${normalized} est déjà autorisée.`);
    }

    const created = await emailAutoriseRepository.create(normalized, actorId);

    await logAudit({
      action: AuditAction.CREATION,
      entity: "EmailAutorise",
      entityId: created.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Ajout de l'adresse email autorisée ${normalized}.`,
    });

    return created;
  },

  async remove(id: string, actorId: string, ip?: string) {
    const existing = await emailAutoriseRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Adresse email autorisée introuvable.");
    }

    await emailAutoriseRepository.delete(id);

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "EmailAutorise",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Suppression de l'adresse email autorisée ${existing.email}.`,
    });

    return { id, supprime: true };
  },

  /**
   * Utilisé par la synchronisation IMAP : détermine si l'expéditeur d'un mail
   * fait partie de la liste autorisée. Toute adresse absente est ignorée
   * silencieusement par l'appelant (pas d'erreur levée ici).
   */
  async isAutorise(email: string): Promise<boolean> {
    const normalized = email.trim().toLowerCase();
    const found = await emailAutoriseRepository.findByEmail(normalized);
    return !!found;
  },
};

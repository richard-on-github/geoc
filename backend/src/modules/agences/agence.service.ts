import { agenceRepository } from "./agence.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { MESSAGES } from "../../constants/messages.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";
import type {
  AgenceAllQueryParams,
  AgenceQueryParams,
  CreateAgenceInput,
  UpdateAgenceInput,
  UpdateAgenceStatusInput,
} from "./agence.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const agenceService = {
  async getAll(params: AgenceQueryParams) {
    const { agences, total, page, limit } =
      await agenceRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { agences, pagination };
  },

  async getAllWithoutPagination(params: AgenceAllQueryParams) {
    return agenceRepository.findAllWithoutPagination(params);
  },

  async getById(id: string) {
    const agence = await agenceRepository.findById(id);
    if (!agence) {
      throw ApiError.notFound("Agence introuvable");
    }
    return agence;
  },

  async create(input: CreateAgenceInput, actorId: string, ip?: string) {
    const existingCode = await agenceRepository.findByCode(input.code);
    if (existingCode) {
      throw ApiError.conflict(
        `Le code agence "${input.code}" est déjà utilisé.`,
      );
    }

    const agence = await agenceRepository.create(input);

    await logAudit({
      action: AuditAction.CREATION,
      entity: "Agence",
      entityId: agence.id,
      userId: actorId,
      agenceId: agence.id,
      ip: ip ?? "",
      message: `Création de l'agence "${agence.nom}" (${agence.code})`,
      after: agence as any,
    });

    return agence;
  },

  async update(
    id: string,
    input: UpdateAgenceInput,
    actorId: string,
    ip?: string,
  ) {
    const agence = await agenceRepository.findById(id);
    if (!agence) {
      throw ApiError.notFound("Agence introuvable");
    }

    if (input.code && input.code !== agence.code) {
      const existing = await agenceRepository.findByCode(input.code, id);
      if (existing) {
        throw ApiError.conflict(
          `Le code agence "${input.code}" est déjà utilisé.`,
        );
      }
    }

    const before = { ...agence };
    const updatedAgence = await agenceRepository.update(id, input);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "Agence",
      entityId: id,
      userId: actorId,
      agenceId: id,
      ip: ip ?? "",
      message: `Modification de l'agence "${agence.nom}"`,
      before: before as any,
      after: updatedAgence as any,
    });

    return updatedAgence;
  },

  async updateStatus(
    id: string,
    input: UpdateAgenceStatusInput,
    actorId: string,
    ip?: string,
  ) {
    const agence = await agenceRepository.findById(id);
    if (!agence) {
      throw ApiError.notFound("Agence introuvable");
    }

    const before = { ...agence };
    const updatedAgence = await agenceRepository.updateStatus(id, input.actif);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "Agence",
      entityId: id,
      userId: actorId,
      agenceId: id,
      ip: ip ?? "",
      message: `${input.actif ? "Activation" : "Désactivation"} de l'agence "${agence.nom}"`,
      before: before as any,
      after: updatedAgence as any,
    });

    return updatedAgence;
  },

  async delete(id: string, actorId: string, ip?: string) {
    const agence = await agenceRepository.findById(id);
    if (!agence) {
      throw ApiError.notFound("Agence introuvable");
    }

    // Sécurité : On empêche de supprimer une agence qui contient des données
    if (agence._count.users > 0 || agence._count.ventes > 0) {
      throw ApiError.badRequest(
        "Impossible de supprimer cette agence car elle est associée à des utilisateurs ou des ventes. Désactivez-la plutôt.",
      );
    }

    await agenceRepository.delete(id);

    await logAudit({
      action: AuditAction.SUPPRESSION,
      entity: "Agence",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Suppression de l'agence "${agence.nom}" (${agence.code})`,
      before: agence as any,
    });
  },
};

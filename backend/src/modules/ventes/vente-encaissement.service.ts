import { venteEncaissementRepository } from "./vente-encaissement.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction, StatutEncaissement } from "@prisma/client";

/**
 * Détermine le statut d'encaissement en comparant le cumul encaissé au
 * "total à solder" (Vente.totalSolde — PAS totalVente, qui lui ne sert qu'au
 * calcul de l'abattement, cf. module abattements).
 */
function computeStatutEncaissement(
  montantEncaisseCumule: number,
  totalSolde: number,
): StatutEncaissement {
  if (montantEncaisseCumule <= 0) return StatutEncaissement.NON_ENCAISSE;
  if (montantEncaisseCumule >= totalSolde) return StatutEncaissement.COMPLET;
  return StatutEncaissement.PARTIEL;
}

export const venteEncaissementService = {
  async enregistrerEncaissement(
    venteId: string,
    montant: number,
    dateEncaissement: Date,
    actorId: string,
    ip?: string,
  ) {
    const vente = await venteEncaissementRepository.findVenteById(venteId);
    if (!vente) {
      throw ApiError.notFound("Vente introuvable.");
    }

    const encaissement = await venteEncaissementRepository.createEncaissement(
      venteId,
      montant,
      dateEncaissement,
      actorId,
    );

    const montantEncaisseCumule =
      await venteEncaissementRepository.sumEncaissements(venteId);
    const totalSolde = Number(vente.totalSolde);
    const nouveauStatut = computeStatutEncaissement(
      montantEncaisseCumule,
      totalSolde,
    );

    await venteEncaissementRepository.updateStatutEncaissement(
      venteId,
      nouveauStatut,
    );

    await logAudit({
      action: AuditAction.CREATION,
      entity: "Encaissement",
      entityId: encaissement.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Encaissement de ${montant} FCFA enregistré le ${dateEncaissement.toISOString()} pour la vente ${venteId} (N° TS10 : ${vente.numeroTS10}). Cumul : ${montantEncaisseCumule}/${totalSolde} -> statut ${nouveauStatut}.`,
    });

    return {
      encaissement,
      montantEncaisseCumule,
      totalSolde,
      statutEncaissement: nouveauStatut,
    };
  },

  async getHistorique(venteId: string) {
    const vente = await venteEncaissementRepository.findVenteById(venteId);
    if (!vente) {
      throw ApiError.notFound("Vente introuvable.");
    }

    const encaissements =
      await venteEncaissementRepository.findEncaissementsByVenteId(venteId);
    const montantEncaisseCumule =
      await venteEncaissementRepository.sumEncaissements(venteId);

    return {
      encaissements,
      montantEncaisseCumule,
      totalSolde: Number(vente.totalSolde),
      statutEncaissement: vente.statutEncaissement,
    };
  },
};

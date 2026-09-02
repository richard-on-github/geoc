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
  if (montantEncaisseCumule <= 0) return StatutEncaissement.NON_SOLDE;
  if (montantEncaisseCumule >= totalSolde) return StatutEncaissement.SOLDE;
  return StatutEncaissement.PARTIELLEMENT_SOLDE;
}

export const venteEncaissementService = {
  /**
   * @param peutEncaisserPartiel Calculé par le contrôleur à partir des
   * permissions de l'utilisateur connecté (permission `vente.encaissement.partiel.manage`).
   * Si l'encaissement en cours d'enregistrement ne solde pas entièrement le
   * montant dû ET que l'utilisateur n'a pas cette permission, l'opération
   * est refusée — même s'il a la permission générique `vente.encaissement.manage`
   * (celle-ci ne couvre que les encaissements soldant intégralement le solde).
   */
  async enregistrerEncaissement(
    venteId: string,
    montant: number,
    dateEncaissement: Date,
    actorId: string,
    peutEncaisserPartiel: boolean,
    ip?: string,
  ) {
    const vente = await venteEncaissementRepository.findVenteById(venteId);
    if (!vente) {
      throw ApiError.notFound("Vente introuvable.");
    }

    const totalSolde = Number(vente.totalSolde);
    const montantEncaisseCumuleAvant =
      await venteEncaissementRepository.sumEncaissements(venteId);
    const montantEncaisseCumuleApres = montantEncaisseCumuleAvant + montant;

    const seraitPartiel = montantEncaisseCumuleApres < totalSolde;

    if (seraitPartiel && !peutEncaisserPartiel) {
      throw ApiError.forbidden(
        "Vous n'avez pas la permission d'enregistrer un encaissement partiel. " +
          "Seul un encaissement soldant intégralement le montant dû est autorisé pour votre rôle.",
      );
    }

    const encaissement = await venteEncaissementRepository.createEncaissement(
      venteId,
      montant,
      dateEncaissement,
      actorId,
    );

    const nouveauStatut = computeStatutEncaissement(
      montantEncaisseCumuleApres,
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
      message: `Encaissement de ${montant} FCFA enregistré le ${dateEncaissement.toISOString()} pour la vente ${venteId} (N° TS10 : ${vente.numeroTS10}). Cumul : ${montantEncaisseCumuleApres}/${totalSolde} -> statut ${nouveauStatut}.`,
    });

    return {
      encaissement,
      montantEncaisseCumule: montantEncaisseCumuleApres,
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

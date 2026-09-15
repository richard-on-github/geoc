import { venteEncaissementRepository } from "./vente-encaissement.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction, Encaissement, StatutEncaissement } from "@prisma/client";

function computeStatutEncaissement(
  montantEncaisseCumule: number,
  totalSolde: number,
): StatutEncaissement {
  if (montantEncaisseCumule <= 0) return StatutEncaissement.NON_SOLDE;
  if (montantEncaisseCumule >= totalSolde) return StatutEncaissement.SOLDE;
  return StatutEncaissement.PARTIELLEMENT_SOLDE;
}

export const venteEncaissementService = {
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

    if (montantEncaisseCumuleApres > totalSolde) {
      const montantRestant = totalSolde - montantEncaisseCumuleAvant;
      throw ApiError.badRequest(
        montantRestant > 0
          ? `Le montant encaissé dépasse le solde restant dû. ` +
              `Montant restant à encaisser : ${montantRestant} FCFA.`
          : "Cette vente est déjà entièrement soldée.",
      );
    }

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

    const tousLesEncaissements =
      await venteEncaissementRepository.findEncaissementsByVenteId(venteId);

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

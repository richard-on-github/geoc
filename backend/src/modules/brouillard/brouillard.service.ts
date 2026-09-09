import { StatutAnomalieBrouillard, AuditAction } from "@prisma/client";
import { brouillardRepository } from "./brouillard.repository.js";
import { abattementRepository } from "../abattements/abattement.repository.js";
import {
  computeAbattement,
  type StatutAbattement,
} from "../abattements/abattement-calcul.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { getPaginationMeta } from "../../utils/pagination.js";
import type { BrouillardQueryParams } from "./brouillard.interface.js";

function mapStatutAbattementVersAnomalie(
  statutAbattement: StatutAbattement,
): StatutAnomalieBrouillard {
  switch (statutAbattement) {
    case "AUCUN":
      return StatutAnomalieBrouillard.OK;
    case "RETARD":
      return StatutAnomalieBrouillard.RETARD;
    case "MOINS_VERSE":
      return StatutAnomalieBrouillard.MOINS_VERSE;
    case "MOINS_VERSE_AVEC_RETARD":
      return StatutAnomalieBrouillard.MOINS_VERSE_RETARD;
    case "NON_VERSE":
      return StatutAnomalieBrouillard.NON_VERSE;
  }
}

export const brouillardService = {
  /**
   * Recalcule et synchronise le brouillard d'une vente à partir de son état
   * actuel (encaissements + abattement calculé). Reste totalement neutre
   * (no-op) si le brouillard est déjà CLÔTURÉ/VALIDÉ/REJETÉ : une fois
   * figé, seules les actions de workflow explicites peuvent le faire
   * évoluer — jamais un recalcul automatique, exactement comme un arrêté
   * comptable journalier réel.
   *
   * À appeler : (1) juste après la création de chaque vente importée, avec
   * un tableau d'encaissements vide ; (2) après chaque encaissement
   * enregistré, avec la liste complète et à jour des encaissements de
   * cette vente.
   */
  async recalculer(
    vente: {
      id: string;
      agenceId: string | null;
      numeroTS10: string;
      totalVente: number | string;
      totalSolde: number | string;
      dateDebut: Date;
    },
    encaissements: Array<{ montant: number | string; dateEncaissement: Date }>,
  ) {
    const existant = await brouillardRepository.findByVenteId(vente.id);
    if (existant && existant.statut !== "OUVERT") {
      return existant;
    }

    const parametres = await abattementRepository.getParametres();
    const abattement = computeAbattement(
      {
        totalVente: vente.totalVente,
        totalSolde: vente.totalSolde,
        dateDebut: vente.dateDebut,
      },
      encaissements,
      parametres,
    );

    const totalSolde = Number(vente.totalSolde);
    const montantVerse = encaissements.reduce(
      (sum, e) => sum + Number(e.montant),
      0,
    );
    const ecart = totalSolde - montantVerse;

    // Le trop-versé prime sur la classification "timing" de l'abattement :
    // peu importe si le paiement était dans les temps ou en retard, un
    // montant supérieur au dû est une anomalie à part entière.
    const statutAnomalie: StatutAnomalieBrouillard =
      montantVerse > totalSolde
        ? StatutAnomalieBrouillard.TROP_VERSE
        : mapStatutAbattementVersAnomalie(abattement.statut);

    return brouillardRepository.upsertPourVente({
      venteId: vente.id,
      journee: vente.dateDebut,
      agenceId: vente.agenceId,
      numeroTS10: vente.numeroTS10,
      ventes: Number(vente.totalVente),
      soldeAttendu: totalSolde,
      montantVerse,
      ecart,
      penalite: abattement.montantAbattement,
      statutAnomalie,
    });
  },

  async getAll(params: BrouillardQueryParams) {
    const { items, total, page, limit } =
      await brouillardRepository.findAll(params);
    const pagination = getPaginationMeta(total, page, limit);
    return { items, pagination };
  },

  async cloturer(
    id: string,
    actorId: string,
    situation: string | undefined,
    ip?: string,
  ) {
    const brouillard = await brouillardRepository.findById(id);
    if (!brouillard) {
      throw ApiError.notFound("Brouillard introuvable.");
    }
    if (brouillard.statut !== "OUVERT") {
      throw ApiError.badRequest(
        `Ce brouillard est déjà ${brouillard.statut.toLowerCase()}, il ne peut plus être clôturé.`,
      );
    }

    const result = await brouillardRepository.cloturer(id, actorId, situation);

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "Brouillard",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Clôture du brouillard du ${brouillard.journee.toLocaleDateString("fr-FR")} (N° TS10 ${brouillard.numeroTS10}).`,
    });

    return result;
  },

  async valider(id: string, actorId: string, ip?: string) {
    const brouillard = await brouillardRepository.findById(id);
    if (!brouillard) {
      throw ApiError.notFound("Brouillard introuvable.");
    }
    if (brouillard.statut !== "CLOTURE") {
      throw ApiError.badRequest("Seul un brouillard clôturé peut être validé.");
    }

    const result = await brouillardRepository.valider(id, actorId);

    await logAudit({
      action: AuditAction.VALIDATION,
      entity: "Brouillard",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Validation du brouillard du ${brouillard.journee.toLocaleDateString("fr-FR")} (N° TS10 ${brouillard.numeroTS10}).`,
    });

    return result;
  },

  async rejeter(id: string, actorId: string, raison: string, ip?: string) {
    const brouillard = await brouillardRepository.findById(id);
    if (!brouillard) {
      throw ApiError.notFound("Brouillard introuvable.");
    }
    if (brouillard.statut !== "CLOTURE") {
      throw ApiError.badRequest("Seul un brouillard clôturé peut être rejeté.");
    }

    const result = await brouillardRepository.rejeter(id, actorId, raison);

    await logAudit({
      action: AuditAction.REJET,
      entity: "Brouillard",
      entityId: id,
      userId: actorId,
      ip: ip ?? "",
      message: `Rejet du brouillard du ${brouillard.journee.toLocaleDateString("fr-FR")} (N° TS10 ${brouillard.numeroTS10}) : ${raison}`,
    });

    return result;
  },
};

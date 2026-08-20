import { abattementRepository } from "./abattement.repository.js";
import type { VenteAvecVersement } from "./abattement.repository.js";
import { computeAbattement } from "./abattement-calcul.js";
import { ApiError } from "../../utils/ApiError.js";
import { logAudit } from "../../utils/audit.js";
import { AuditAction } from "@prisma/client";
import type {
  AbattementQueryParams,
  AbattementParametresInput,
} from "./abattement.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

export const abattementService = {
  async getParametres() {
    return abattementRepository.getParametres();
  },

  async updateParametres(
    input: AbattementParametresInput,
    actorId: string,
    ip?: string,
  ) {
    const updated = await abattementRepository.updateParametres(
      input,
      actorId,
    );

    await logAudit({
      action: AuditAction.MODIFICATION,
      entity: "AbattementParametres",
      entityId: updated.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Mise à jour des paramètres d'abattement : ${JSON.stringify(input)}`,
    });

    return updated;
  },

  async enregistrerVersement(
    venteId: string,
    montantVerse: number,
    dateVersement: Date,
    actorId: string,
    ip?: string,
  ) {
    const vente = await abattementRepository.findVenteById(venteId);
    if (!vente) {
      throw ApiError.notFound("Vente introuvable.");
    }

    const versementExistant =
      await abattementRepository.findVersementByVenteId(venteId);

    const versement = await abattementRepository.upsertVersement(
      venteId,
      montantVerse,
      dateVersement,
      actorId,
    );

    await logAudit({
      action: versementExistant ? AuditAction.MODIFICATION : AuditAction.CREATION,
      entity: "AbattementVersement",
      entityId: versement.id,
      userId: actorId,
      ip: ip ?? "",
      message: `Versement de ${montantVerse} FCFA enregistré le ${dateVersement.toISOString()} pour la vente ${venteId} (N° TS10 : ${vente.numeroTS10}).`,
    });

    return versement;
  },

  async getAll(params: AbattementQueryParams) {
    const parametres = await abattementRepository.getParametres();

    // "statut" est un champ CALCULÉ (dépend du versement + des paramètres +
    // de l'heure courante), jamais stocké en base : impossible de le filtrer
    // au niveau SQL. Quand ce filtre est actif, on doit donc calculer le
    // statut de toutes les lignes correspondant aux AUTRES filtres, puis
    // filtrer et paginer en mémoire — au lieu de paginer en base d'abord
    // (ce qui produirait des pages tronquées ou vides à tort).
    if (params.statut) {
      const { page = 1, limit = 50 } = params;
      const toutesLesVentes =
        await abattementRepository.findAllVentesAvecVersement(params);

      const toutesLesLignes = toutesLesVentes.map((vente: VenteAvecVersement) => ({
        vente,
        abattement: computeAbattement(
          vente,
          vente.abattementVersement
            ? {
                montantVerse: Number(vente.abattementVersement.montantVerse),
                dateVersement: vente.abattementVersement.dateVersement,
              }
            : null,
          parametres,
        ),
      }));

      const lignesFiltrees = toutesLesLignes.filter(
        (ligne) => ligne.abattement.statut === params.statut,
      );

      const total = lignesFiltrees.length;
      const debut = (page - 1) * limit;
      const lignes = lignesFiltrees.slice(debut, debut + limit);
      const pagination = getPaginationMeta(total, page, limit);

      return { lignes, pagination, parametres };
    }

    // Chemin normal (aucun filtre sur champ calculé) : pagination SQL classique.
    const { ventes, total, page, limit } =
      await abattementRepository.findVentesAvecVersement(params);

    const lignes = ventes.map((vente: VenteAvecVersement) => ({
      vente,
      abattement: computeAbattement(
        vente,
        vente.abattementVersement
          ? {
              montantVerse: Number(vente.abattementVersement.montantVerse),
              dateVersement: vente.abattementVersement.dateVersement,
            }
          : null,
        parametres,
      ),
    }));

    const pagination = getPaginationMeta(total, page, limit);
    return { lignes, pagination, parametres };
  },
};

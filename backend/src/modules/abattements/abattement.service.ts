import { abattementRepository } from "./abattement.repository.js";
import type { VenteAvecEncaissements } from "./abattement.repository.js";
import { computeAbattement } from "./abattement-calcul.js";
import { AuditAction } from "@prisma/client";
import { logAudit } from "../../utils/audit.js";
import type {
  AbattementQueryParams,
  AbattementParametresInput,
} from "./abattement.interface.js";
import { getPaginationMeta } from "../../utils/pagination.js";

function calculerLigne(vente: VenteAvecEncaissements, parametres: Awaited<ReturnType<typeof abattementRepository.getParametres>>) {
  return {
    vente,
    abattement: computeAbattement(
      vente,
      vente.encaissements.map((e) => ({
        montant: e.montant,
        dateEncaissement: e.dateEncaissement,
      })),
      parametres,
    ),
  };
}

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

  async getAll(params: AbattementQueryParams) {
    const parametres = await abattementRepository.getParametres();

    // "statut" (et la régularisation) sont des champs CALCULÉS, jamais
    // stockés en base : impossible de les filtrer au niveau SQL. Quand ce
    // filtre est actif, on calcule d'abord tout, on filtre, puis on pagine
    // en mémoire — au lieu de paginer en base d'abord (pages tronquées à tort).
    if (params.statut) {
      const { page = 1, limit = 50 } = params;
      const toutesLesVentes =
        await abattementRepository.findAllVentesAvecEncaissements(params);

      const toutesLesLignes = toutesLesVentes.map((vente) =>
        calculerLigne(vente, parametres),
      );

      const lignesFiltrees = toutesLesLignes.filter(
        (ligne) => ligne.abattement.statut === params.statut,
      );

      const total = lignesFiltrees.length;
      const debut = (page - 1) * limit;
      const lignes = lignesFiltrees.slice(debut, debut + limit);
      const pagination = getPaginationMeta(total, page, limit);

      return { lignes, pagination, parametres };
    }

    const { ventes, total, page, limit } =
      await abattementRepository.findVentesAvecEncaissements(params);

    const lignes = ventes.map((vente) => calculerLigne(vente, parametres));

    const pagination = getPaginationMeta(total, page, limit);
    return { lignes, pagination, parametres };
  },
};

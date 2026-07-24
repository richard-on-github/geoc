import { dashboardRepository } from "./dashboard.repository.js";
import type {
  DashboardQueryParams,
  DashboardKPIs,
} from "./dashboard.interface.js";
import { Prisma } from "@prisma/client";

export const dashboardService = {
  async getDashboardSummary(
    params: DashboardQueryParams,
    scopeWhere: Prisma.VenteWhereInput = {},
  ) {
    const where = dashboardRepository.buildWhereClause(params, scopeWhere);

    // Exécution en parallèle pour optimiser le temps de réponse
    const [rawKpis, topKiosques, topAgents] = await Promise.all([
      dashboardRepository.getGlobalKPIs(where),
      dashboardRepository.getTopKiosques(where, 5),
      dashboardRepository.getTopAgents(where, 5),
    ]);

    // Calcul du taux de recouvrement (pourcentage encaisse / CA)
    const tauxRecouvrement =
      rawKpis.totalVente > 0
        ? Number(((rawKpis.totalPaye / rawKpis.totalVente) * 100).toFixed(2))
        : 0;

    const kpis: DashboardKPIs = {
      chiffreAffairesTotal: rawKpis.totalVente,
      totalEncaisse: rawKpis.totalPaye,
      resteARecouvrer: rawKpis.totalSolde,
      nombreTransactions: rawKpis.count,
      tauxRecouvrement,
    };

    return {
      kpis,
      topKiosques,
      topAgents,
    };
  },
};
